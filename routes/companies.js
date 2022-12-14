const express = require('express');
const router = express.Router();
const db = require('../db');
const slugify = require('slugify');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try{
    const results = await db.query('SELECT * FROM companies');
    return res.json({companies: results.rows});
    } catch(e){
        return next(e);
    };
});

router.get('/:code', async (req, res, next) => {
   try{
    const { code } = req.params;
    const results = await db.query('SELECT * FROM companies WHERE code=$1', [code]);
    const invResults = await db. query('SELECT id FROM invoices WHERE comp_code=$1', [code])
    const indResults = await db.query('SELECT * FROM companies_industries WHERE comp_code=$1', [code])
    if (results.rows.length === 0){
        throw new ExpressError('company does not exist', 404);
    };
    
    const invoices = invResults.rows;
    const industries = indResults.rows;

    results.rows[0].invoices = invoices.map(inv => inv.id)
    results.rows[0].industries = industries.map(ind => ind.industry_code)

    return res.json({company: results.rows});
   }catch(e){
    return next(e);
   };
});

router.post('/', async (req, res, next) => {
    try{
        const {name, description} = req.body
        const code = slugify(name, {lower:true} )
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        return res.status(201).json({company: results.rows});
    }catch(e) {
        return next(e);
    };
});

router.patch('/:code', async (req, res, next) => {
    try{
        const {code} = req.params
        const {name, description} = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code]);
        if (results.rows.length === 0){
            throw new ExpressError('company not found', 404);
        };
        return res.json({company: results.rows});
    }catch(e) {
        return next(e);
    };
});

router.delete('/:code', async (req, res, next) => {
    try{
        const {code} = req.params
        const results = await db.query('DELETE FROM companies WHERE code=$1', [code])
        if (!results){
            throw new ExpressError('company not found', 404);
        };
        return res.json({status: 'DELETED'});
    }catch(e) {
        return next(e);
    };
});


module.exports = router