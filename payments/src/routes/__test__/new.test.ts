import { Order } from '../../models/order';
import request from 'supertest';
import { OrderStatus } from '@karantickets/common';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 when purchasing an error that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'adsfjkh',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404);
});

it('returns not authorized error 401 when purchasing other users order', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 500,
        status: OrderStatus.Created
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'adsfjkh',
            orderId: order.id
        })
        .expect(401);
});

it('returns 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 500,
        status: OrderStatus.Cancelled
    });
    await order.save();
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'adsfjkh',
            orderId: order.id
        })
        .expect(400);
});