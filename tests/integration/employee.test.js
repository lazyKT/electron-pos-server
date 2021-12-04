/**
 * Integration Tests for Employees End Points
 **/

const request = require('supertest');

const { Employee } = require('../../express_server/schemas/employee');


let server 


describe('/api/employees', () => {

	// run this before each test suite
	beforeEach (() => {
		// initialize the server
		server = require('../../server');
	});

	// run this after each test suite
	afterEach ( async () => {
		// close the server
		server.close();
		// clean up database after test suite
		await Employee.deleteMany({});
	});
	
	// get all employees
	describe ('GET /', () => {

		it ('should return all employees', async() => {

			// populate test data into Employee Document
			await Employee.collection.insertMany ([
				{ username: 'user1' },
				{ username: 'user2' },
				{ username: 'user3' },
				{ username: 'user4' },
			]);

			const response = await request(server).get('/api/employees');
			
			expect(response.status).toBe(200);
			expect(response.body.length).toBe(4);
			expect(response.body.some (emp => emp.username === 'user1'));
			expect(response.body.some (emp => emp.username === 'user2'));
			expect(response.body.some (emp => emp.username === 'user3'));
			expect(response.body.some (emp => emp.username === 'user4'));
		});
	});

	// get employee by object id
	describe ('GET /:id', () => {

		it ('should return employee if valid id is given', async () => {

			const emp = new Employee({ 
				username: 'user1',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			});
			await emp.save();

			const response = await request(server).get(`/api/employees/${emp._id}`);
			
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('username', emp.username);
			expect(response.body).toHaveProperty('fullName', emp.fullName);
			expect(response.body).toHaveProperty('mobile', emp.mobile);
			expect(response.body).toHaveProperty('level', emp.level);
			expect(response.body.password).toEqual(undefined);
		});

		it ('should return 404 if invalid id is given', async () => {

			const response = await request(server).get(`/api/employees/1`);

			expect(response.status).toBe(404);
		});
	});


	// register new employee
	describe ('POST /', () => {

		it ('should return 400 if username is less than 4 chars', async () => {
			const emp = {
				username: 'emp',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			};

			const response = await request(server).post('/api/employees').send(emp);

			expect(response.status).toBe(400);
		});

		it ('should return 400 if username is more than 20 chars', async () => {
			const emp = {
				username: new Array(22).join('u'),
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			};

			const response = await request(server).post('/api/employees').send(emp);

			expect(response.status).toBe(400);
		});

		it ('should return 400 if fullName is less than 4 chars', async () => {
			const emp = {
				username: 'emp',
				fullName: 'User',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			};

			const response = await request(server).post('/api/employees').send(emp);

			expect(response.status).toBe(400);
		});

		it ('should return 201 if registration is success', async () => {
			const emp = {
				username: 'user1',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			};

			const response = await request(server).post('/api/employees').send(emp);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('username', emp.username);
			expect(response.body).toHaveProperty('fullName', emp.fullName);
			expect(response.body).toHaveProperty('mobile', emp.mobile);
			expect(response.body).toHaveProperty('level', emp.level);
			expect(response.body.password).toEqual(undefined);
		});
	});


	// log in
	describe ('POST /login', () => {

		it ('should return 400 if invalid credentials is given', async () => {
			const emp = new Employee({ 
				username: 'user1',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			});
			await emp.save();

			const response = await request(server).post('/api/employees/login').send({
				username: 'username',
				password: 'password'
			});

			expect(response.status).toBe(400);
		});

		it ('should return 401 if wrong password is given', async () => {
			const emp = new Employee({ 
				username: 'user1',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			});
			await emp.save();

			const response = await request(server).post('/api/employees/login').send({
				username: 'user1',
				password: 'password'
			});

			expect(response.status).toBe(401);
		});

		it ('should return 200 if authentication is success', async () => {
			const emp = new Employee({ 
				username: 'user1',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			});
			await emp.save();

			const response = await request(server).post('/api/employees/login').send({
				username: 'user1',
				password: 'user1password'
			});

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('username', emp.username);
			expect(response.body).toHaveProperty('fullName', emp.fullName);
			expect(response.body).toHaveProperty('mobile', emp.mobile);
			expect(response.body).toHaveProperty('level', emp.level);
			expect(response.body.password).toEqual(undefined);
		});
	});


	// update/edit
	describe ('PUT /:id', () => {

		it ('should return 404 if invalid object id is given', async () => {

			const response = await request(server).put(`/api/employees/1`).send({'username' : 'user1'});

			expect(response.status).toBe(404);
		});

		it ('should return 201 if employee is updated', async () => {

			const emp = new Employee({ 
				username: 'user1',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			});
			await emp.save();

			const response = await request(server).put(`/api/employees/${emp._id}`).send({
				username: 'user1Updated',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty('username', 'user1Updated');
		});
	});


	// delete
	describe ('DELETE /:id', () => {

		it ('should return 404 if invalid object id is given', async () => {

			const response = await request(server).delete(`/api/employees/1`);

			expect(response.status).toBe(404);
		});

		it ('should return 201 if employee is updated', async () => {

			const emp = new Employee({ 
				username: 'user1',
				fullName: 'User One',
				mobile: '12341234',
				password: 'user1password',
				level: 3
			});
			await emp.save();

			const response = await request(server).delete(`/api/employees/${emp._id}`);

			expect(response.status).toBe(200);
		});
	});

});