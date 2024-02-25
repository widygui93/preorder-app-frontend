let updateCartItem = () => {
    const cart = JSON.parse(window.localStorage.getItem('cart'));

    if(cart != null){
        document.getElementById('cart-total-item').innerText = cart.totalQuantity;
        document.getElementById('cart-total-item').classList.remove('visually-hidden');
    }
}

updateCartItem();

const form = document.querySelector('form');
const nameError = document.querySelector('.name-error');
const emailError = document.querySelector('.email-error');
const confirmPasswordError = document.querySelector('.confirm-password-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // get values
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // reset errors
    nameError.textContent    = '';
    emailError.textContent    = '';
    confirmPasswordError.textContent = '';

    try{
        const result = await fetch('http://localhost:3300/signup',{
            credentials: "include",
            method: 'POST',
            body: JSON.stringify({ name, email, password, confirmPassword }),
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await result.json();
        if(data.errors){
            nameError.textContent = data.errors.name;
            emailError.textContent = data.errors.email;
            confirmPasswordError.textContent = data.errors.password;
        }
        if(data.user){
            location.assign('index.html');
        }
    } catch(err){
        console.log(err);
    }
});

// fetch data api wilayah indonesia
const getDataApiWilayahIndonesia = async (url) => {
    try {
       const response = await fetch(url);
       return await response.json();
    } catch(error) {
       console.log(error);
       return error;
    }
}

const renderOptions = async (args) => {
    let { url, selector, defaultValue } = args;
    let options;

    removeOptions(selector);
    options = document.createElement("option");
    options.setAttribute("value", 0);
    options.setAttribute("selected", "");
    options.innerHTML = defaultValue;
    document.querySelector(selector).append(options);

    try{
        let response = await getDataApiWilayahIndonesia(url);
        response.forEach((res) => {
            options = document.createElement("option");
            options.setAttribute("value", res.id);
            options.innerHTML = res.name;

            document.querySelector(selector).append(options);
        });
    } catch(err){
        console.log(err);
    }
    
}

const removeOptions = (selector) => {
    let parent = document.querySelector(selector);
    while (parent.hasChildNodes()) {
      parent.removeChild(parent.firstChild);
    }
}

renderOptions(
    {
        url: "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
        selector: ".select-province", 
        defaultValue: "Select province"
    }
);


// when user select province
document.getElementsByClassName('select-province')[0].addEventListener("change", () => {
    let valueProvince = document.getElementsByClassName('select-province')[0].value;
    if(valueProvince === "0"){
        removeOptions(".select-city");
        removeOptions(".select-district");
        removeOptions(".select-village");
    } else {
        removeOptions(".select-district");
        removeOptions(".select-village");
        renderOptions(
            {
                url: `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${valueProvince}.json`,
                selector: ".select-city", 
                defaultValue: "Select city"
            }
        );
    }
});

// when user select city
document.getElementsByClassName('select-city')[0].addEventListener("change", () => {
    let valueCity = document.getElementsByClassName('select-city')[0].value;
    if(valueCity === "0"){
        removeOptions(".select-district");
        removeOptions(".select-village");
    } else {
        removeOptions(".select-village");
        renderOptions(
            {
                url: `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${valueCity}.json`,
                selector: ".select-district", 
                defaultValue: "Select district"
            }
        );
    }
});

// when user select district
document.getElementsByClassName('select-district')[0].addEventListener("change", () => {
    let valueDistrict = document.getElementsByClassName('select-district')[0].value;
    if(valueDistrict === "0"){
        removeOptions(".select-village");
    } else {
        renderOptions(
            {
                url: `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${valueDistrict}.json`,
                selector: ".select-village", 
                defaultValue: "Select village"
            }
        );
    }
});

// when user click search button for address
document.getElementsByClassName('btn-search-address')[0].addEventListener("click", async () => {
    const btnSearchAddress = document.querySelector('button.btn-search-address');
    btnSearchAddress.setAttribute("disabled", "");
    btnSearchAddress.innerHTML = "";

    const spinner = document.createElement("span");
    spinner.classList.add("spinner-border", "spinner-border-sm");
    spinner.setAttribute("aria-hidden", "true");

    btnSearchAddress.append(spinner);

    // remove list adress to select new address
    const listGroupAddress = document.querySelector('ul.list-group');
    if(listGroupAddress) listGroupAddress.remove();


    const searchAddress = document.getElementsByClassName('input-address')[0].value;
    try {
       const response = await fetch(`https://nominatim.openstreetmap.org/search?addressdetails=1&q=${searchAddress}&format=jsonv2&limit=5`);
       const addresses = await response.json();

       const ul = document.createElement("ul");
        ul.classList.add("list-group");

        let li;
        let p;
        let small;

        if(addresses.length === 0) {
            li = document.createElement("li");
            li.classList.add("list-group-item");
            li.innerHTML = "Address not found";
            ul.append(li);
        } else{
            addresses.forEach((address) => {
            li = document.createElement("li");
            li.setAttribute("type", "button");
            li.setAttribute("x-lat", address.lat);
            li.setAttribute("x-lon", address.lon);
            li.setAttribute("onclick", "showInMap(this)");
            li.classList.add("list-group-item", "list-group-item-action");

            p = document.createElement("p");
            p.innerHTML = address.display_name;
            li.append(p);

            small = document.createElement("small");
            small.innerHTML = `Postcode: ${address.address.postcode || 0} | Lat: ${address.lat} | Lon: ${address.lon}`;
            li.append(small);

            ul.append(li);
                
            });
       }

       document.querySelector(".search-address").append(ul);

       console.log(addresses);
       console.log(addresses[0].display_name);
       console.log(addresses[0].address.postcode);
       console.log(addresses[0].lat);
       console.log(addresses[0].lon);

    } catch(error) {
       console.log(error);
    }

    btnSearchAddress.removeChild(btnSearchAddress.firstElementChild);
    btnSearchAddress.innerHTML = "Search";
    btnSearchAddress.removeAttribute("disabled");

    
});

let map = L.map('map');
let latitude;
let longitude;

function showInMap(address) {

    latitude = address.getAttribute("x-lat");
    longitude = address.getAttribute("x-lon");

    // reset map
    map = map.off();
    map = map.remove();
        
    map = L.map('map').setView([latitude, longitude], 15);
    
    let tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let marker = L.marker([latitude, longitude],{draggable: true}).addTo(map);
    marker.on('dragend', onMakerMove);

    console.log(map);
    console.log(map._lastCenter);
}

function onMakerMove(e) {
    console.log(e);
    console.log(e.target._latlng.lat.toString());
    console.log(e.target._latlng.lng.toString());

    latitude = e.target._latlng.lat.toString();
    longitude = e.target._latlng.lng.toString();
}

var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  // This function will display the specified tab of the form ...
  var tabs = document.getElementsByClassName("tab");
  tabs[n].style.display = "block";
  // ... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (tabs.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  // ... and run a function that displays the correct step indicator:
  stepIndicator(n)
}

function stepIndicator(n) {
  // This function removes the "active" class of all breadcrumb-item...
  var i, x = document.getElementsByClassName("breadcrumb-item");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active";
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var tabs = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && currentTab == 0 && !validateFormPersonalInformation()) return false;
  if (n == 1 && currentTab == 1 && !validateFormShippingAddressInformation()) return false;
  // Hide the current tab:
  tabs[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  // if (currentTab >= x.length) {
  //   //...the form gets submitted:
  //   document.getElementById("regForm").submit();
  //   return false;
  // }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateFormPersonalInformation() {
    // This function deals with validation of the form fields
    var tabs, inputs, i, valid = true;
    var validEmail = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/;
    tabs = document.getElementsByClassName("tab");
    inputs = tabs[currentTab].getElementsByTagName("input");
    // A loop that checks every input field in the current tab:
    for (i = 0; i < inputs.length; i++) {
        // If a field is empty...
        if (inputs[i].value == "") {
          // add an "invalid" class to the field:
          inputs[i].className += " invalid";
          // and set the current valid status to false:
          valid = false;
        }

        if(inputs[i].name === "email" && !inputs[i].value.match(validEmail) ){
          // add an "invalid" class to the field:
          inputs[i].className += " invalid";
          // and set the current valid status to false:
          valid = false;
        } 

        if(inputs[i].name === "password")
        {
            if(inputs[i].value != inputs[i + 1].value){
              // add an "invalid" class to the field:
              inputs[i].className += " invalid";
              inputs[i + 1].className += " invalid";
              // and set the current valid status to false:
              valid = false;
            }
        }
    }

    if(valid){
        for (i = 0; i < inputs.length; i++) {
            inputs[i].classList.remove("invalid");
        }
    }
    return valid; // return the valid status
}

function validateFormShippingAddressInformation(){
    let valid = true;

    let selectProvince = document.getElementsByClassName("select-province");
    if(selectProvince[0].value === "0"){
        selectProvince[0].className += " invalid";
        valid = false;
        return valid;
    } else {
        selectProvince[0].classList.remove("invalid");
        valid = true;
    }

    let selectCity = document.getElementsByClassName("select-city");
    if(selectCity[0].value === "0"){
        selectCity[0].className += " invalid";
        valid = false;
        return valid;
    } else {
        selectCity[0].classList.remove("invalid");
        valid = true;
    }

    let selectDistrict = document.getElementsByClassName("select-district");
    if(selectDistrict[0].value === "0"){
        selectDistrict[0].className += " invalid";
        valid = false;
        return valid;
    } else {
        selectDistrict[0].classList.remove("invalid");
        valid = true;
    }

    let selectVillage = document.getElementsByClassName("select-village");
    if(selectVillage[0].value === "0"){
        selectVillage[0].className += " invalid";
        valid = false;
        return valid;
    } else {
        selectVillage[0].classList.remove("invalid");
        valid = true;
    }

    let inputCodePost = document.getElementById('inputCodePost');
    if(inputCodePost.value === ""){
        inputCodePost.className += " invalid";
        valid = false;
        return valid;
    } else {
        inputCodePost.classList.remove("invalid");
        valid = true;
    }

    let inputDetailAddress = document.getElementById('inputDetailAddress');
    if(inputDetailAddress.value === ""){
        inputDetailAddress.className += " invalid";
        valid = false;
        return valid;
    } else {
        inputDetailAddress.classList.remove("invalid");
        valid = true;
    }

    if(latitude === undefined && longitude === undefined){
        document.getElementById('inputAddress').className += " invalid";
        valid = false;
        return valid;
    } else {
        document.getElementById('inputAddress').classList.remove("invalid");
        valid = true;
    }
    return valid;
}

// resource
// https://nominatim.org/release-docs/develop/api/Search/#examples
// https://leafletjs.com/examples/quick-start/
// https://www.openstreetmap.org/
// https://www.w3schools.com/howto/howto_js_form_steps.asp?
// https://www.emsifa.com/api-wilayah-indonesia/