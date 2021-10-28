// const { application } = require("express")

// document.addEventListener("click",()=>{
//     console.log("Click Detected")
//     let payload = { //payload = req.body on server
//         message:"Succesful POST via Axios onClick Event"
//     }
//     axios.post("/api/clicktest",payload)
//     .then((res)=>{
//         console.log(res)
//     })
// })

    let submission = (event) => {
        event.preventDefault()
        console.log(document.querySelector("#confirmation-input"))
        console.log(document.querySelector("#confirmation-input").value)
        if(document.querySelector("#confirmation-input").value.length>0){
            let payload = {
                code:document.querySelector("#confirmation-input").value
            }
            axios.post("/api/submit",payload)
            .then((res)=>{
                console.log(res.data)
                let payload = res.data
                axios.post("api/initstripe",payload) //only after /submit returns with res- a promise chain. This is awaiting resolutin of /api/submit
                .then((res)=>{
                    console.log(res)
                     window.location = res.data.url
                })
                .catch((err)=>console.log(err))
                //ANOTHER API CALL TO SEND DATA HERE, TO /api/init-stripe
               
            })
            .catch((err)=>console.log(err))
        }
    }
    document.querySelector("#submit-button").addEventListener("click",submission)
