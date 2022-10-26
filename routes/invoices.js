const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');


router.get('/', async (req, res, next) => {
    try{
        const results = await db.query('SELECT * FROM invoices');
        return res.json({invoices: results.rows})
    }catch(e) {
        return next(e);
    };
});

router.get('/:id', async (req, res, next) => {
    try{
        const {id} = req.params
        const results = await db.query('SELECT * FROM invoices WHERE id=$1', [id]);
        if (results.rows.length === 0){
            throw new ExpressError('invoice not found', 404);
        };
        return res.json({invoice: results.rows})
    }catch(e) {
        return next(e);
    };
});

router.post('/', async (req, res, next) => {
    try{
        const {comp_code, amt} = req.body
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
        return res.json({invoice: results.rows });
    }catch(e) {
        return next(e);
    };
});

router.patch('/:id', async (req, res, next) => {
    try{
        const {id} = req.params;
        const {amt, paid} = req.body;
        const results = await db.query('UPDATE invoices SET amt=$1, paid=$2 WHERE id=$3 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, paid, id] )
        if (results.rows.length === 0){
            throw new ExpressError('invoice not found', 404);
        }
        
        if(results.rows[0].paid != true){
            results.rows[0].paid_date = null
        }else {
            results.rows[0].paid_date = new Date();
        }

        return res.json({invoice: results.rows})
    }catch(e) {
        return next(e);
    };
});

router.delete('/:id', async (req, res, next) => {
    try{
        const {id} = req.params;
        const results = await db.query('DELETE FROM invoices WHERE id=$1', [id])
        if (!results){
            throw new ExpressError('invoice not found', 404);
        };
        return res.json({status: 'deleted'});
    }catch(e) {
        return next(e);
    };
});


module.exports = router;