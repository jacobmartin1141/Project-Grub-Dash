const e = require("express");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");


function hasDeliverTo(req, res, next) {
    const { deliverTo } = req.body.data;

    if(deliverTo) {
        next();
    } else {
        next({
            status: 400,
            message: "Order must include a deliverTo",
        })
    }
}

function hasMobileNumber(req, res, next) {
    const { mobileNumber } = req.body.data;

    if(mobileNumber) {
        next();
    } else {
        next({
            status: 400,
            message: "Order must include a mobileNumber",
        })
    }
}

function hasDish(req, res, next) {
    const { dishes } = req.body.data;

    if(dishes && Array.isArray(dishes)) {
        next();
    } else {
        next({
            status: 400,
            message: "Order must include at least one dish",
        })
    }
}

function hasValidQuantity(req, res, next) {
    const { dishes } = req.body.data;

    if(dishes.length === 0) {
        next({
            status: 400,
            message: "Order must include at least one dish."
        })
    }

    dishes.forEach((dish, index) => {
        if(!dish.quantity || !Number.isInteger(dish.quantity)) {
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`
            })
        }
        
    });

    next();
}

function create(req, res, next) {
    const newOrder = req.body.data;

    newOrder.id = nextId();

    orders.push(newOrder);

    res.status(201).json({ data: newOrder });
}

function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    console.log(orderId, foundOrder);

    if(foundOrder) {
        res.locals.foundOrder = foundOrder;
        next();
    } else {
        next({
            status: 404,
            message: `Order does not exist: ${orderId}.`,
        });
    }
}

function read(req, res, next) {
    res.status(200).json({ data: res.locals.foundOrder});
}

function bodyIdMatchesRoute(req, res, next) {
    // next();

    const { orderId } = req.params;
    const updatedOrder = req.body.data;
    const id = updatedOrder.id

    if(!id) {
        updatedOrder.id = orderId;
        res.locals.updatedOrder = updatedOrder;
        next();
    } else if(id === orderId) {
        res.locals.updatedOrder = updatedOrder;
        next();
    } else {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
        })
    }
}

function hasStatus(req, res, next) {
    const ordersStatus = req.body.data.status;
    const validStatus = [
        "pending",
        "preparing",
        "out-for_delivery",
        "delivered",
    ];
    
    if(!validStatus.includes(ordersStatus) || !ordersStatus) {
        res.locals.ordersStatus = ordersStatus;
        next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered: ${ordersStatus}`,
        });
    } else {
        next();
    }
}

function notDelivered(req, res, next) {
    next();

    const foundOrder = res.locals.foundOrder;

    if(foundOrder.status === "delivered") {
        next({
            status: 400,
            message: "A delivered order cannot be changed",
        })
    } else {
        next();
    }
}

function update(req, res, next) {
    const { orderId } = req.params;
    const updatedOrder = res.locals.updatedOrder;
 
    //orders.findIndex((order) => order.id == orderId) = updatedOrder;
    res.status(200).json({ data: updatedOrder });
}

function isPending(req, res, next) {
    const ordersStatus = res.locals.foundOrder.status;

    if(ordersStatus === "pending") {
        next();
    } else {
        next({
            status: 400,
            message: "An order cannot be deleted unless it is pending",
        });
    }
}

function remove(req, res, next) {
    const { orderId } = req.params;

    orders.find((order, index) => {
        if(order.id === orderId) {
            orders.splice(index, 1);

            res.status(204).send();

            return true;
        }
        return false;
    })
}

function list(req, res, next) {
    res.status(200).json({ data: orders });
}

module.exports = {
    create: [hasDeliverTo, hasMobileNumber, hasDish, hasValidQuantity, create],
    read: [orderExists, read],
    update: [orderExists, hasDeliverTo, hasDish, hasMobileNumber, hasValidQuantity, hasStatus, notDelivered, bodyIdMatchesRoute, update],
    remove: [orderExists, isPending, remove],
    list,
}

//hasDeliverTo, hasMobileNumber, hasDish, hasValidQuantity, create, orderExists, read
//hasStatus, notDelivered, bodyIdMatchesRoute, update

//