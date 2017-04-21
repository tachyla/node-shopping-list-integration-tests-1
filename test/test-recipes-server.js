const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const should = chai.should();
chai.use(chaiHttp);

describe('Recipes', function () {


    before(function () {
        return runServer();
    })


    after(function () {
        return closeServer();
    });

    it('should list recipes on GET'), function () {
        return chai.request(app)
            .get('/recipes')
            .then(function (res) {
                res.should.have.status(200);
                res.should.json;
                res.body.should.be.a('array');
                res.body.should.have.length.of.at.least(1);
                const expectedKeys = ['id', 'name', 'ingredients'];
                res.body.forEach(function (item) {
                    item.should.be.a('object');
                    item.should.include.keys(expectedKeys);
                });
            });
    };
    it('should add a recipe on POST', function () {
        const newRecipe = { name: 'coffee', ingredients: ['coffeeBeans', 'water'] };
        return chai.request(app)
            .post('/recipes')
            .send(newRecipe)
            .then(function (res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'name', 'ingredients');
                // res.body.id.should.not.be.null;
                res.body.name.should.equal(newRecipe.name);
                res.body.ingredients.should.be.a('array');
                res.body.ingredients.should.include.members(newRecipe.ingredients);
            });
    });

    it('should update recipes on PUT', function () {
        const updateRecipe = {
            name: 'coffee',
            ingredients: ['milk', 'sugar']
        };
        return chai.request(app)
            .get('/recipes')
            .then(function (res) {
                updateRecipe.id = res.body[0].id;
                return chai.request(app)
                    .put(`/recipes/${updateRecipe.id}`)
                    .send(updateRecipe)
            })
            .then(function (res) {
                res.should.have.status(200);
                // res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('id', 'name', 'ingredients');

                res.body.name.should.equal(updateRecipe.name);
                res.body.id.should.equal(updateRecipe.id);

                // res.body.ingredients.should.be.a('array');
                res.body.ingredients.should.include.members(updateRecipe.ingredients);
                // res.body.should.deep.equal(updateRecipe);
            });
    });

    // test strategy:
    //  1. GET a shopping list items so we can get ID of one
    //  to delete.
    //  2. DELETE an item and ensure we get back a status 204    
    it('should delete recipes on DELETE', function () {
        return chai.request(app)
            // first have to get so we have an `id` of item
            // to delete
            .get('/recipes')
            .then(function (res) {
                return chai.request(app)
                    .delete(`/recipes/${res.body[0].id}`);
            })
            .then(function (res) {
                res.should.have.status(204);
            });
    });
});