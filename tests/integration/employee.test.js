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

});