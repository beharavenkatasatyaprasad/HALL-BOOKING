const express = require('express');
const Joi = require('joi');
const app = express();
const port = 3000 || process.env.PORT
app.use(express.json());

app.get('/', (req,res) => {
    res.redirect('/api')
})

app.get('/api',(req,res) => {
    res.status(200)
    res.send(`
    <ul>
        <h1>Welcome</h1>
        <li><h1>For Creating room use <span style="color:red">/api/createRoom</span></h1></li>
        <li><h1>For Booking room use <span style="color:red">/api/bookRoom</span></h1></li>
        <li><h1>to List All rooms use <span style="color:red">/api/ListAllRooms</span></h1></li>
        <li><h1>to List All Customers use <span style="color:red">/api/ListAllCustomers</span></h1></li>
    </ul>
    `);

    res.end()
})

let customers = []
let rooms = []
let  customer_bookings = []

//create an endpoint for creating new room
app.post('/api/createRoom', (req,res) => {

    const schema = Joi.object({
        name : Joi.string().required(),
        amenities : Joi.array(),
        NoOfSeatsAvail : Joi.number().required(),
        oneHourPrice : Joi.number().required()
    });   
   
    const {error} = schema.validate(req.body);
    if(error){
        return res.send(error.details[0].message);
    }

    const newRoom = {
        id : rooms.length +1,
        name : req.body.name,
        amenities : req.body.amenities,
        NoOfSeatsAvailable : req.body.NoOfSeatsAvail,
        oneHourPrice : "Rupees "+req.body.oneHourPrice+"/- Only"
    };
    rooms.push(newRoom);
    return res.status(201).json({ message : "successfully Created New Room", data : newRoom})
})

//create an endpoint for Booking a room
app.post("/api/bookRoom",(req,res) => {
    const schema = Joi.object({
        CustomerName : Joi.string().required(),
        roomid : Joi.number().required(),
        startDate : Joi.date().required(),
        endDate : Joi.date().required()
    });
   
    const {error} = schema.validate(req.body);
    if(error){
        return res.send(error.details[0].message);
    }

        const bookingExists =  customer_bookings.find((booking) =>
            (((req.body.startDate <= booking.startDate && (req.body.endDate >= booking.startDate && req.body.endDate <= booking.endDate))
            || (req.body.endDate >= booking.startDate && req.body.endDate <= booking.endDate)))
            && booking.roomid== req.body.roomid);
    
    if(bookingExists) return res.status(422).json({message : "Sorry, the room is already booked in the same time range"});

    let newBooking = {
        Bookingid :  customer_bookings.length + 1,
        roomid : req.body.roomid,
        startDate : req.body.startDate,
        endDate : req.body.endDate
    }
    const CustomerDetails = {
        name : req.body.CustomerName,        
        custid : customers.length + 1,
    };
    customers.push(CustomerDetails);
    customer_bookings.push(newBooking);
    // console.log(customers)
    return res.status(201).json({ message : "Booking Successful", BookingDetails : newBooking, customerDetails : CustomerDetails})
})

//create an endpoint for listing all rooms with booked data
app.get("/api/listAllRooms",(req,res) =>{
    const allRoomsData = [];
    customer_bookings.forEach((booking) =>{
        bookingViewModel = {
            roomName : rooms.find(x => x.id == booking.roomid).name,
            customerName : customers.find(x => x.id == booking.custid).name,
            bookedStatus : "Successful",
            startDate : booking.startDate,
            endDate : booking.endDate
        }
        allRoomsData.push(bookingViewModel);
    });

    res.send(allRoomsData);
})

//create an endpoint for listing all customers with booked data
app.get("/api/listAllCustomers",(req,res) =>{
    const allCustomersData = [];
    customer_bookings.forEach((booking) =>{
        bookingViewModel = {
            customerName : customers.find(x => x.id == booking.custid).name,
            roomName : rooms.find(x => x.id == booking.roomid).name,
            startDate : booking.startDate,
            endDate : booking.endDate
        }
        allCustomersData.push(bookingViewModel);
    });

    res.send(allCustomersData);
})


app.listen(port,() =>{
    console.log('listening on port' , `${port}`)
});
