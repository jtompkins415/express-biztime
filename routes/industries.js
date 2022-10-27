const express = require('express');
const router = express.Router();
const db = require('../db');
const slugify = require('slugify');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(
            'SELECT ind.industry_code, ind.name, c.code FROM industries AS ind LEFT JOIN companies_industries AS ci ON ind.industry_code = ci.industry_code LEFT JOIN companies AS c on ci.comp_code = c.code')
        return res.json({industries: results.rows})
    }catch(e){
        return next(e)
    }
})

router.post('/', async (req, res, next) => {
    try{
        const {industry_code, name} = req.body
        const results = await db.query('INSERT INTO industries (industry_code, name) VALUES ($1, $2) RETURNING industry_code, name', [industry_code, name]);
        
        return res.json({industry: results.rows})
    }catch(e){
        return next(e)
    };
});


router.post('/:industry_code', async (req, res, next) => {
    try{
        const {industry_code} = req.params
        const {comp_code} = req.body
        const results = await db.query('INSERT INTO companies_industries (comp_code, industry_code) VALUES ($1, $2) RETURNING comp_code, industry_code' [comp_code, industry_code])

        if(results.rows.length === 0) {
            throw new ExpressError('industry not found', 404)
        }

        return res.json({comp_industry: results.rows})
    }catch(e) {
        return next(e)
    }
})
module.exports = router;