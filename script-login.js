let updateCartItem = () => {
    const cart = JSON.parse(window.localStorage.getItem('cart'));

    if(cart != null){
        document.getElementById('cart-total-item').innerText = cart.totalQuantity;
        document.getElementById('cart-total-item').classList.remove('visually-hidden');
    }
}

updateCartItem();

const form = document.querySelector('form');
const loginError = document.querySelector('.login-error');


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // get values
    const email = form.email.value;
    const password = form.password.value;

    // reset errors
    loginError.textContent    = '';

    try{
        const result = await fetch('http://localhost:3300/login',{
            credentials: "include",
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await result.json();
        if(data.errors){
            loginError.textContent = data.errors.message;
        }
        if(data.user){
            location.assign('index.html');
        }
    } catch(err){
        console.log(err);
    }
});