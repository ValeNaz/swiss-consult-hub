/**
 * Google Places & Address Validation Service
 * Sistema universale per validazione e autocompletamento indirizzi globali
 */

export interface AddressSuggestion {
    description: string;
    placeId: string;
    mainText: string;
    secondaryText: string;
    types: string[];
}

export interface AddressDetails {
    street: string;
    streetNumber: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    countryCode: string;
    formattedAddress: string;
    latitude?: number;
    longitude?: number;
}

export interface AddressValidationResult {
    isValid: boolean;
    address: AddressDetails | null;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    suggestions?: AddressDetails[];
}

class GooglePlacesService {
    private autocompleteService: google.maps.places.AutocompleteService | null = null;
    private placesService: google.maps.places.PlacesService | null = null;
    private geocoder: google.maps.Geocoder | null = null;
    private sessionToken: google.maps.places.AutocompleteSessionToken | null = null;
    private isLoaded = false;
    private apiKey = '';
    private detectedCountry = 'CH'; // Default fallback

    /**
     * Initialize Google Places API
     */
    async initialize(): Promise<void> {
        if (this.isLoaded) return;

        // Get API key from environment
        this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

        // Check if Google Maps is already loaded
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            this.autocompleteService = new google.maps.places.AutocompleteService();
            this.sessionToken = new google.maps.places.AutocompleteSessionToken();
            this.geocoder = new google.maps.Geocoder();

            const dummyDiv = document.createElement('div');
            this.placesService = new google.maps.places.PlacesService(dummyDiv);

            this.isLoaded = true;
            await this.detectUserCountry();
            return;
        }

        // Load Google Maps script dynamically
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            // Load with multiple libraries and auto-detect language
            const userLang = navigator.language.split('-')[0];
            script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geocoding&language=${userLang}&region=${this.detectedCountry}`;
            script.async = true;
            script.defer = true;

            script.onload = async () => {
                this.autocompleteService = new google.maps.places.AutocompleteService();
                this.sessionToken = new google.maps.places.AutocompleteSessionToken();
                this.geocoder = new google.maps.Geocoder();

                const dummyDiv = document.createElement('div');
                this.placesService = new google.maps.places.PlacesService(dummyDiv);

                this.isLoaded = true;
                await this.detectUserCountry();
                resolve();
            };

            script.onerror = () => {
                console.warn('Google Maps API failed to load. Using fallback mode.');
                reject(new Error('Failed to load Google Maps API'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Detect user's country automatically using geolocation
     */
    private async detectUserCountry(): Promise<void> {
        try {
            // Try to get user's position
            if ('geolocation' in navigator) {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 5000,
                        maximumAge: 300000
                    });
                });

                if (this.geocoder) {
                    const result = await this.geocoder.geocode({
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    });

                    if (result.results && result.results.length > 0) {
                        const countryComponent = result.results[0].address_components?.find(
                            c => c.types.includes('country')
                        );
                        if (countryComponent) {
                            this.detectedCountry = countryComponent.short_name;
                            console.log('Detected country:', this.detectedCountry);
                        }
                    }
                }
            }
        } catch (error) {
            // Fallback to browser language
            const browserLang = navigator.language;
            const countryFromLang = browserLang.split('-')[1] || 'CH';
            this.detectedCountry = countryFromLang.toUpperCase();
            console.log('Using country from browser language:', this.detectedCountry);
        }
    }

    /**
     * Get detected or default country
     */
    getDetectedCountry(): string {
        return this.detectedCountry;
    }

    /**
     * Get address suggestions based on input
     * @param input - User input string
     * @param countryCode - Optional country code (auto-detected if not provided)
     * @param restrictToCountry - Whether to restrict results to specific country
     */
    async getAddressSuggestions(
        input: string,
        countryCode?: string,
        restrictToCountry: boolean = false
    ): Promise<AddressSuggestion[]> {
        if (!input || input.length < 2) return [];

        try {
            await this.initialize();

            if (!this.autocompleteService) {
                return this.getFallbackSuggestions(input, countryCode || this.detectedCountry);
            }

            const targetCountry = countryCode || this.detectedCountry;

            return new Promise((resolve) => {
                const requestOptions: google.maps.places.AutocompletionRequest = {
                    input,
                    sessionToken: this.sessionToken!,
                    types: ['address']
                };

                // Only restrict to country if explicitly requested
                if (restrictToCountry && targetCountry) {
                    requestOptions.componentRestrictions = { country: targetCountry.toLowerCase() };
                }

                this.autocompleteService!.getPlacePredictions(
                    requestOptions,
                    (predictions, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                            const suggestions: AddressSuggestion[] = predictions.map((prediction) => ({
                                description: prediction.description,
                                placeId: prediction.place_id,
                                mainText: prediction.structured_formatting.main_text,
                                secondaryText: prediction.structured_formatting.secondary_text || '',
                                types: prediction.types || []
                            }));
                            resolve(suggestions);
                        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                            // Try again without country restriction
                            if (restrictToCountry) {
                                this.getAddressSuggestions(input, countryCode, false).then(resolve);
                            } else {
                                resolve([]);
                            }
                        } else {
                            resolve([]);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error getting address suggestions:', error);
            return this.getFallbackSuggestions(input, countryCode || this.detectedCountry);
        }
    }

    /**
     * Get detailed address information from place ID
     */
    async getPlaceDetails(placeId: string): Promise<AddressDetails | null> {
        try {
            await this.initialize();

            if (!this.placesService) {
                return null;
            }

            return new Promise((resolve) => {
                this.placesService!.getDetails(
                    {
                        placeId,
                        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
                        sessionToken: this.sessionToken!,
                    },
                    (place, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                            const addressDetails = this.parseAddressComponents(
                                place.address_components || [],
                                place.formatted_address || '',
                                place.geometry
                            );

                            // Reset session token after getting details
                            this.sessionToken = new google.maps.places.AutocompleteSessionToken();

                            resolve(addressDetails);
                        } else {
                            resolve(null);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error getting place details:', error);
            return null;
        }
    }

    /**
     * Validate an address using Google Address Validation API
     * Requires Address Validation API enabled in Google Cloud Console
     */
    async validateAddress(addressString: string): Promise<AddressValidationResult> {
        try {
            await this.initialize();

            if (!this.geocoder) {
                return {
                    isValid: false,
                    address: null,
                    confidence: 'LOW'
                };
            }

            const result = await this.geocoder.geocode({ address: addressString });

            if (result.results && result.results.length > 0) {
                const topResult = result.results[0];
                const parsedAddress = this.parseAddressComponents(
                    topResult.address_components,
                    topResult.formatted_address,
                    topResult.geometry
                );

                // Determine confidence based on location type
                let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
                if (topResult.geometry.location_type === google.maps.GeocoderLocationType.ROOFTOP) {
                    confidence = 'HIGH';
                } else if (topResult.geometry.location_type === google.maps.GeocoderLocationType.RANGE_INTERPOLATED) {
                    confidence = 'MEDIUM';
                } else {
                    confidence = 'LOW';
                }

                // Get alternative suggestions if available
                const suggestions = result.results.slice(1, 4).map(r =>
                    this.parseAddressComponents(
                        r.address_components,
                        r.formatted_address,
                        r.geometry
                    )
                );

                return {
                    isValid: true,
                    address: parsedAddress,
                    confidence,
                    suggestions: suggestions.length > 0 ? suggestions : undefined
                };
            }

            return {
                isValid: false,
                address: null,
                confidence: 'LOW'
            };
        } catch (error) {
            console.error('Error validating address:', error);
            return {
                isValid: false,
                address: null,
                confidence: 'LOW'
            };
        }
    }

    /**
     * Parse address components from Google response
     * Handles multiple formats and countries
     */
    private parseAddressComponents(
        components: google.maps.GeocoderAddressComponent[],
        formattedAddress: string,
        geometry?: google.maps.places.PlaceGeometry
    ): AddressDetails {
        let street = '';
        let streetNumber = '';
        let city = '';
        let state = '';
        let postalCode = '';
        let country = '';
        let countryCode = '';
        let latitude: number | undefined;
        let longitude: number | undefined;

        // Extract coordinates if available
        if (geometry?.location) {
            latitude = typeof geometry.location.lat === 'function'
                ? geometry.location.lat()
                : geometry.location.lat;
            longitude = typeof geometry.location.lng === 'function'
                ? geometry.location.lng()
                : geometry.location.lng;
        }

        components.forEach((component) => {
            const types = component.types;

            // Street name
            if (types.includes('route')) {
                street = component.long_name;
            }

            // Street number
            if (types.includes('street_number')) {
                streetNumber = component.long_name;
            }

            // City - try multiple types for different countries
            if (types.includes('locality')) {
                city = component.long_name;
            } else if (!city && types.includes('postal_town')) {
                city = component.long_name;
            } else if (!city && types.includes('administrative_area_level_2')) {
                city = component.long_name;
            } else if (!city && types.includes('administrative_area_level_3')) {
                city = component.long_name;
            }

            // State/Province
            if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
            }

            // Postal code
            if (types.includes('postal_code')) {
                postalCode = component.long_name;
            }

            // Country
            if (types.includes('country')) {
                country = component.long_name;
                countryCode = component.short_name;
            }
        });

        // Fallback: if no street found, try sublocality
        if (!street) {
            const sublocality = components.find(c => c.types.includes('sublocality'));
            if (sublocality) {
                street = sublocality.long_name;
            }
        }

        return {
            street,
            streetNumber,
            city,
            state,
            postalCode,
            country,
            countryCode,
            formattedAddress,
            latitude,
            longitude
        };
    }

    /**
     * Fallback suggestions when Google API is not available
     */
    private getFallbackSuggestions(input: string, countryCode: string): AddressSuggestion[] {
        // Simple fallback - just return the input as a suggestion
        return [
            {
                description: input,
                placeId: 'fallback',
                mainText: input,
                secondaryText: countryCode.toUpperCase(),
            },
        ];
    }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();
