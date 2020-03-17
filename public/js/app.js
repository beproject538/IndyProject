const form = document.querySelector('form')

const search = document.querySelector('input')

const messageOne = document.querySelector('#msg1')
const messageTwo = document.querySelector('#msg2')

form.addEventListener('submit', (event) => {
    event.preventDefault()

    const poolName = search.value

    messageOne.textContent = 'Loading...'
    messageTwo.textContent = ''

    fetch('/pool?poolName='+encodeURIComponent(poolName)).then((response) => {
        response.json().then((data) => {
            if(data.error){
                console.log('Error')
                messageOne.textContent = data.error
            } else{
                messageOne.textContent = data.poolName+' has been created with pool handle '+ data.poolHandle
            }
        })
    })
})