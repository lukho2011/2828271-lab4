// script.js

// Get DOM elements
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// API base URLs
const BASE_URL = 'https://restcountries.com/v3.1/name';
const ALPHA_URL = 'https://restcountries.com/v3.1/alpha';

// Add hidden class initially
loadingSpinner.classList.add('hidden');
errorMessage.classList.add('hidden');

// Event listeners
searchBtn.addEventListener('click', () => {
    const country = countryInput.value.trim();
    if (country) {
        searchCountry(country);
    } else {
        showError('Please enter a country name');
    }
});

// Allow Enter key to search
countryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const country = countryInput.value.trim();
        if (country) {
            searchCountry(country);
        } else {
            showError('Please enter a country name');
        }
    }
});

// Main search function - using async/await and try/catch (REQUIRED)
async function searchCountry(countryName) {
    try {
        // Show loading spinner, hide previous results/errors
        showLoading();
        clearResults();
        
        // Fetch country data
        const response = await fetch(`${BASE_URL}/${encodeURIComponent(countryName)}`);
        
        if (!response.ok) {
            throw new Error(`Country not found: ${countryName}`);
        }
        
        const data = await response.json();
        const country = data[0]; // API returns array, take first result
        
        // Display country info
        displayCountryInfo(country);
        
        // Fetch and display bordering countries if they exist
        if (country.borders && country.borders.length > 0) {
            await displayBorderingCountries(country.borders);
        } else {
            borderingCountries.innerHTML = '<p>No bordering countries</p>';
            borderingCountries.classList.remove('hidden');
        }
        
    } catch (error) {
        // Show error message
        showError(error.message);
    } finally {
        // Hide loading spinner
        hideLoading();
    }
}

// Display country information
function displayCountryInfo(country) {
    countryInfo.innerHTML = `
        <h2>${country.name.common}</h2>
        <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <img src="${country.flags.svg}" alt="${country.name.common} flag" width="200">
    `;
    countryInfo.classList.remove('hidden');
}

// Display bordering countries
async function displayBorderingCountries(borderCodes) {
    try {
        const borderPromises = borderCodes.map(code => 
            fetch(`${ALPHA_URL}/${code}`).then(res => res.json())
        );
        
        const borderCountries = await Promise.all(borderPromises);
        
        borderingCountries.innerHTML = '<h3>Bordering Countries:</h3>';
        
        borderCountries.forEach(country => {
            if (country[0]) {
                borderingCountries.innerHTML += `
                    <div class="country-item">
                        <img src="${country[0].flags.svg}" alt="${country[0].name.common} flag">
                        <p>${country[0].name.common}</p>
                    </div>
                `;
            }
        });
        
        borderingCountries.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching border countries:', error);
        borderingCountries.innerHTML = '<p>Error loading bordering countries</p>';
    }
}

// Show loading spinner
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// Clear previous results
function clearResults() {
    countryInfo.classList.add('hidden');
    borderingCountries.classList.add('hidden');
    errorMessage.classList.add('hidden');
}


