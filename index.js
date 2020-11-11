const Joi = require('joi');
const express = require('express');
const app = express();

app.use(express.json());
const port = process.env.PORT || 3000

app.listen(port, () => console.log('listening on port' , `${port}`));

app.get("/", function (req, res) {
    res.writeHead(200,{'content-Type':'text-html'})
    res.write(`
    <ul>
        <h1>Welcome</h1>
        <li><h1>For Creating room use <span style="color:red">/CreateRoom</span></h1></li>
        <li><h1>For Adding New Customer <span style="color:red">/addNewCustomer</span></h1></li>
        <li><h1>For Booking room use <span style="color:red">/BookRoom</span></h1></li>
        <li><h1>to List All rooms use <span style="color:red">/ListAllRooms</span></h1></li>
        <li><h1>to List All Customers use <span style="color:red">/ListAllCustomers</span></h1></li>
    </ul>
    `);

    res.end()
});
  
let customers = []

let rooms = []

let customer_bookings = []
//Create a new room endpoint

app.post('/CreateRoom', (req, res) =>{
    const schema = Joi.object({
        name : Joi.string().min(5).required(),
        amenities : Joi.array(),
        location : Joi.string().required(),
        oneHourPrice : Joi.number().required()
    });

    const {error} = schema.validate(req.body);
    if(error) return res.send(error.details[0].message);

    // Add the new entry in rooms

    const newRoom = {
        id : rooms.length +1,
        name : req.body.name,
        amenities : req.body.amenities,
        NoOfSeatsAvail : Joi.number().required(),
        oneHourPrice : req.body.oneHourPrice
    };

    rooms.push(newRoom);
    return res.status(201).json({ message : "Data successfully added", data : newRoom})
});

//add new customer
app.post('/addNewCustomer', (req, res) =>{
    const schema = Joi.object({
        name : Joi.string().min(5).required(),
        address : Joi.string().required()
    });

    const {error} = schema.validate(req.body);
    if(error) return res.send(error.details[0].message);

    // Check if hall already Exists 
    
    let isPresent = customers.find((customer) => customer.name == req.body.name);
    if(isPresent) return res.status(422).json({message : "customer with the same username already Exists"});

    // Add the new entry in customers

    const NewCustomer = {
        id : customers.length +1,
        name : req.body.name,
        address : req.body.address
        
    };

    customers.push(NewCustomer);
    return res.status(201).json({ message : "Data successfully added", data : NewCustomer})
});
// Book room for customer

app.post('/BookRoom', (req, res) => {
    
    const schema = Joi.object({
        custid : Joi.number().required(),
        roomid : Joi.number().required(),
        startDate : Joi.date().required(),
        endDate : Joi.date().required()
    });

    const {error} = schema.validate(req.body);
    if(error) return res.status(400).json({message : "Bad request", data : error.details[0].message});

    // Check if the room is booked already in the same time range.

    const bookingExists = customer_bookings.find((booking) =>
            (((req.body.startDate <= booking.startDate && (req.body.endDate >= booking.startDate && req.body.endDate <= booking.endDate))
            || (req.body.endDate >= booking.startDate && req.body.endDate <= booking.endDate)))
            && booking.roomid== req.body.roomid);
    
    if(bookingExists) return res.status(422).json({message : "There is already a booking available in the same time range", data : bookingExists});

    let newBooking = {
        id : customer_bookings.length + 1,
        custid : req.body.custid,
        roomid : req.body.roomid,
        startDate : req.body.startDate,
        endDate : req.body.endDate
    }

    customer_bookings.push(newBooking);
    console.log(customer_bookings);
    return res.status(201).json({message : "Booking successful..."})
});

// List all rooms with booked data

app.get('/listAllRooms', (req, res) => {
    let result = [];
    let bookingViewModel;
    customer_bookings.forEach((booking) =>{
        bookingViewModel = {
            customerName : customers.find(x => x.id == booking.custid).name,
            roomName : rooms.find(x => x.id == booking.roomid).name,
            startDate : booking.startDate,
            endDate : booking.endDate
        }
        result.push(bookingViewModel);
    });

    res.send(result);
});

// List all customers

app.get('/listAllCustomers', (req, res) => {
    let result = [];
    let customersViewModel;
    customers.forEach((customer) =>{
        customersViewModel = {
            customerID : customer.id,
            customerName : customer.name,
            address : customer.address,
            isActive : customer.isActive
        }
        result.push(customersViewModel);
    });

    res.send(result);
});
