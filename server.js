require("dotenv").config()
const path = require("path")
const express = require("express")
const mongoose = require("mongoose")
const PORT = process.env.PORT || 3000
const app = express()
const DB = "kvidjobs";
// Remember to switch to the kvid business' live secret key in production. !IMPORTANT
const stripe = require("stripe")(process.env.SECRET_KEY_TEST)

//Init Express connection
app.use(express.json());//unpack JSON formatted payload / send res.json(payload,(callbaback)=>{....})
app.use(express.urlencoded({ extended: true })); //unpack urlEncoded payload 
app.use(express.static( "./client/public")) //NO path,join() here. Only for GET req of index.html
//Init Mongo Connection via Mongoose
mongoose.connect("mongodb://localhost:27017/"+DB,{
    connectTimeoutMS:10000
});

const jobList = [
    {
        id:001,
        jobName:"Job #1",
        price: 300,
        priceInCents:30000,
        description:"First Job",
        confirmationCode:"job-AA"
    },
    {
        id:002,
        jobName:"Job #2",
        price: 700,
        priceInCents:70000,
        description:"Second Job",
        confirmationCode:"job-BB"
    },
    {
        id:003,
        jobName:"Job #3",
        price: 1000,
        priceInCents:100000,
        description:"Third Job",
        confirmationCode:"job-CC"
    }
]
const db = mongoose.connection;
db.on("error",(error)=>console.log(error))
db.once("open",()=>console.log(`Connected to ${DB} database on port ${PORT}`))

const Order = new mongoose.Schema(
    {
        id: Number,
        jobName: String,
        description:String,
        price:Number,
        priceInCents:Number,
        customerName: String,
        confirmationCode: String,
        completed: Boolean,
        paid: Boolean,
    },
    {collection: "jobList"}
)
let OrderModel = db.model("OrderModel",Order)

app.get("/",(req,res)=>{
    console.log("Get Req Index /")
    res.sendFile(path.join(__dirname,"./client/public","index.html"))
})
app.post("/api/clicktest",(req,res)=>{
    if(req.body.message !== undefined){
        console.log(req.body)
    console.log(req.body.message)
    // OrderModel.deleteMany({},(err,doc)=>{
    //     if(err){
    //         console.log(err)
    //     }
    // })

    // OrderModel.insertMany(jobList,(err,doc)=>{
    //     if(err){
    //         console.log(err)
    //     }
    // })
    
        res.json("Success: recieved Message: " + req.body.message.slice(0,10)+"...")
    } //res.data on client side axios .then() promise function
    else if(req.body.message === undefined){
        res.json("Error, res.body undefined")
    }
})
app.post("/api/submit", async (req,res)=>{
    let code = req.body.code // the item id no. to be compared against product array entries
    console.log("Received GET req from client api")
    console.log(code)
    // res.json("Success")
    let matchedJob;
    OrderModel.findOne({confirmationCode:code},(err,doc)=>{
        if(err){
            console.log(err)
        } else if(doc){
            console.log(doc)
            res.json(doc)
           return doc
        } else if(!doc){
            res.json(false)
            console.log("Not found")
        }
    })
})

//Only called from client AFTER client receives back matching doc from /api/submit
app.post("/api/initstripe", async (req,res)=>{
    let matchedJob = req.body
    console.log(req.body)
try{
            const checkoutSession = await stripe.checkout.sessions.create({
                payment_method_types:["card"],
                mode:"payment",
                success_url: process.env.SERVER_ADDRESS+"/success.html",
                cancel_url: process.env.SERVER_ADDRESS+"/cancel.html",
                line_items:[
                {
                    price_data:{
                        currency:"usd",
                        product_data:{
                            name:matchedJob.jobName
                        },
                        unit_amount:  matchedJob.priceInCents  //Stripe requires prices in CENTS not dollars !IMPORTANT
                    },
                    quantity:1
                }
            ]
            })
            res.json({url:checkoutSession.url})

        }
        catch(err){
            console.log("ERROR:")
            console.log(err.message)
            // console.log(err)
            res.status(500).json({error:err.message})
        }
    

    

})

    // .then((doc)=>{
    //     console.log(".then block")
    //     console.log(doc)
    // })
        // try{
            
        //    //await productArr //does not evaluate next lines of function until selection returns resolved value of product doc from mongoose query
        //   const matchedJob = productArr.filter((n,i)=>{ 
        //     if(n.id === selectedProd){
        //         return n
        //     }
        //    })
        //   console.log("MATCH PROD")
        //   console.log(matchedJob)
        //     const checkoutSession = await stripe.checkout.sessions.create({
        //         payment_method_types:["card"],
        //         mode:"payment",
        //         success_url: process.env.SERVER_ADDRESS+"/success.html",
        //         cancel_url: process.env.SERVER_ADDRESS+"/cancel.html",
        //         line_items:[
        //         {
        //             price_data:{
        //                 currency:"usd",
        //                 product_data:{
        //                     name:matchedJob[0].name
        //                 },
        //                 unit_amount:  matchedJob[0].priceInCents  //Stripe requires prices in CENTS not dollars !IMPORTANT
        //             },
        //             quantity:1
        //         }
        //     ]
        //     })
        //     res.json({url:checkoutSession.url})

        // }
        // catch(err){
        //     console.log("ERROR:")
        //     console.log(err.message)
        //     // console.log(err)
        //     res.status(500).json({error:err.message})
        // }
    

    

// })

//Port Connection Listener
app.listen(PORT,()=>{
    console.log("Server started on port"+ PORT)
})

