let map;
let marker;

// Inicializando o mapa
function initMap() {
    map = L.map('map').setView([0, 0], 2); // Inicializa o mapa com um zoom baixo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Função para obter as coordenadas após o usuário clicar no botão
function getCoordinates() {
    const address = document.getElementById('address').value;
    const resultDiv = document.getElementById('result');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&countrycodes=BR`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const place = data[0];
                const latitude = place.lat;
                const longitude = place.lon;
                const addressDetails = place.address;

                // Log para verificar a estrutura dos dados
                console.log('Dados retornados pela API:', place);

                // Obter informações detalhadas do endereço
                const estado = addressDetails.state || 'Não disponível';
                const cidade = addressDetails.city || addressDetails.town || addressDetails.village || 'Não disponível';
                const bairro = addressDetails.suburb || 'Não disponível';
                const cep = addressDetails.postcode || 'Não disponível';

                // Atualizar o resultado em texto
                resultDiv.innerHTML = `<p><strong>Latitude:</strong> ${latitude}</p>
                                       <p><strong>Longitude:</strong> ${longitude}</p>
                                       <p><strong>Estado:</strong> ${estado}</p>
                                       <p><strong>Cidade:</strong> ${cidade}</p>
                                       <p><strong>Bairro:</strong> ${bairro}</p>
                                       <p><strong>CEP:</strong> ${cep}</p>`;

                // Atualizar o mapa e adicionar o marker
                updateMap(latitude, longitude);
            } else {
                resultDiv.innerHTML = `<p>Endereço não encontrado.</p>`;
            }
        })
        .catch(error => {
            resultDiv.innerHTML = `<p>Ocorreu um erro ao buscar as coordenadas.</p>`;
        });
}

// Função para atualizar o mapa e mover o marcador
function updateMap(lat, lon) {
    const latLng = [lat, lon];

    // Centraliza o mapa nas novas coordenadas e ajusta o zoom
    map.setView(latLng, 13);

    // Se o marker já existir, movê-lo para a nova localização
    if (marker) {
        marker.setLatLng(latLng);
    } else {
        // Se não existir, criar um novo marker
        marker = L.marker(latLng).addTo(map);
    }
}

// Função para autocompletar o campo de endereço
function enableAutocomplete() {
    const addressInput = document.getElementById('address');
    const suggestionList = document.getElementById('suggestion-list');
    const clearBtn = document.getElementById('clear-btn');

    addressInput.addEventListener('input', function () {
        const query = addressInput.value;

        // Exibir o botão de limpar se houver texto no campo
        clearBtn.style.display = query.length > 0 ? 'block' : 'none';

        if (query.length >= 3) {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=BR&limit=5`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    suggestionList.innerHTML = ''; // Limpar sugestões anteriores

                    data.forEach(suggestion => {
                        const listItem = document.createElement('li');
                        listItem.textContent = suggestion.display_name;
                        listItem.onclick = function () {
                            addressInput.value = suggestion.display_name;
                            updateMap(suggestion.lat, suggestion.lon);
                            document.getElementById('result').innerHTML = `<p><strong>Latitude:</strong> ${suggestion.lat}</p>
                                                                           <p><strong>Longitude:</strong> ${suggestion.lon}</p>`;
                            suggestionList.innerHTML = ''; // Limpar sugestões após seleção
                        };
                        suggestionList.appendChild(listItem);
                    });
                });
        } else {
            suggestionList.innerHTML = ''; // Limpar sugestões se houver menos de 3 caracteres
        }
    });
}

// Função para limpar o campo de entrada e a lista de sugestões
function clearInput() {
    const addressInput = document.getElementById('address');
    const suggestionList = document.getElementById('suggestion-list');
    const resultDiv = document.getElementById('result');
    const clearBtn = document.getElementById('clear-btn');

    // Limpar o campo de texto, sugestões e resultados
    addressInput.value = '';
    suggestionList.innerHTML = '';
    resultDiv.innerHTML = '';
    clearBtn.style.display = 'none'; // Esconder o botão de limpar
}

// Inicializar o mapa e o autocompletar ao carregar a página
window.onload = function () {
    initMap();
    enableAutocomplete();
};
