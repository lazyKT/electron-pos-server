/**
 * Integration Test for Clinic Invoice API End Potins
 */

const request = require('supertest');

const { ClinicInvoice } = require('../../express_server/schemas/clinicInvoice');


let server

/**
 * Test data
 **/
const invoices = [
  {
    invoiceNumber: '20210912100428345',
    changeAmount: 100,
    givenAmount: 2500,
    payableAmount: 2400,
    patientID: 'p021',
    patientName: 'Amy',
    doctorID: 'd0321',
    doctorName: 'Strange',
    cashier: 'Cathy',
    employeeID: 'e0921'
  },
  {
    invoiceNumber: '20210912101238345',
    changeAmount: 100,
    givenAmount: 2500,
    payableAmount: 2400,
    patientID: 'p021',
    patientName: 'Amy',
    doctorID: 'd0321',
    doctorName: 'Strange',
    cashier: 'Cathy',
    employeeID: 'e0921'
  }
];


describe('/api/clinic/invoices', () => {

  beforeEach(() => {
    server = require('../../server');
  });


  afterEach( async () => {
    server.close();
    await ClinicInvoice.deleteMany({});
  });


  afterAll( async () => {
    await new Promise (resolve => setTimeout(() => resolve(), 500) );
  });


  // GET all clinic invoices
  describe ('GET /api/clinic/invoices', () => {

    it ('should return all clinic invoices', async () => {

      // populate test data into clinic invoices
      await ClinicInvoice.insertMany (invoices);

      const response = await request(server).get('/api/clinic/invoices');

      expect(response.status).toBe(200);
    });

  });


  // Create new Clinic Invoices
  describe ('POST /api/clinic/invoices', () => {

    it ('should return 400 if invalid request body is given', async () => {
      const invoice = {
        invoiceNumber: '20210912100428345',
        changeAmount: 100,
        givenAmount: 2500,
        payableAmount: 2400,
        patientID: 'p021',
        patientName: 'Amy',
        doctorID: 'd0321',
        doctorName: 'Strange',
        cashier: 'Cathy',
        employeeID: 'e0921'
      };

      const response = await request(server).post('/api/clinic/invoices').send(invoice);

      expect(response.status).toBe(400);
    });


    it ('should return 400 if empty services/items list are given', async () => {
      const invoice = {
        invoiceNumber: '20210912100428345',
        changeAmount: 100,
        givenAmount: 2500,
        payableAmount: 2400,
        patientID: 'p021',
        patientName: 'Amy',
        doctorID: 'd0321',
        doctorName: 'Strange',
        cashier: 'Cathy',
        employeeID: 'e0921',
        services: [],
        items: []
      };

      const response = await request(server).post('/api/clinic/invoices').send(invoice);

      expect(response.status).toBe(400);
    });


    it ('should return 400 if invalid service list is given', async () => {
      const invoice = {
        invoiceNumber: '20210912100428345',
        changeAmount: 100,
        givenAmount: 2500,
        payableAmount: 2400,
        patientID: 'p021',
        patientName: 'Amy',
        doctorID: 'd0321',
        doctorName: 'Strange',
        cashier: 'Cathy',
        employeeID: 'e0921',
        services: [
          { price: 2000, qty: 1, totalPrice: 2000}
        ],
        items: [
          {
            productNumber : "nu12p3445lus",
            productName : "Nutroplus",
            productId : "61925b98e2efb885e9f112b8",
            tagId : "618e9e81942a7bd15779e4ec",
            qty : 3,
            price : 1000,
            totalPrice : 3000
          }
        ]
      };

      const response = await request(server).post('/api/clinic/invoices').send(invoice);

      expect(response.status).toBe(400);
    });


    it ('should return 400 if invalid item list is given', async () => {
      const invoice = {
        invoiceNumber: '20210912100428345',
        changeAmount: 100,
        givenAmount: 2500,
        payableAmount: 2400,
        patientID: 'p021',
        patientName: 'Amy',
        doctorID: 'd0321',
        doctorName: 'Strange',
        cashier: 'Cathy',
        employeeID: 'e0921',
        services: [
          {
            description: 'X-ray',
            price: 2000,
            qty: 1,
            totalPrice: 2000
          }
        ],
        items: [
          {
            productNumber : "nu12p3445lus",
            productName : "Nutroplus",
            tagId : "618e9e81942a7bd15779e4ec",
            qty : 3,
            price : 1000,
            totalPrice : 3000
          }
        ]
      };

      const response = await request(server).post('/api/clinic/invoices').send(invoice);

      expect(response.status).toBe(400);
    });


    it ('should return 400 if there is a invalid ObjectID is given', async () => {
      const invoice = {
        invoiceNumber: '20210912100428345',
        changeAmount: 100,
        givenAmount: 2500,
        payableAmount: 2400,
        patientID: 'p021',
        patientName: 'Amy',
        doctorID: 'd0321',
        doctorName: 'Strange',
        cashier: 'Cathy',
        employeeID: 'e0921',
        services: [
          {
            description: 'X-ray',
            price: 2000,
            qty: 1,
            totalPrice: 2000
          }
        ],
        items: [
          {
            productNumber : "nu12p3445lus",
            productName : "Nutroplus",
            productId : "61925b98e2efb885e9f112b8",
            tagId : "618e9e81942a7bd15779e4ec",
            qty : 3,
            price : 1000,
            totalPrice : 3000
          }
        ]
      };

      const response = await request(server).post('/api/clinic/invoices').send(invoice);

      expect(response.status).toBe(400);
    });


    it ('should return 400 if invalid Employee is given', async () => {
      const invoice = {
        invoiceNumber: '20210912100428345',
        changeAmount: 100,
        givenAmount: 2500,
        payableAmount: 2400,
        patientID: 'p021',
        patientName: 'Amy',
        doctorID: 'd0321',
        doctorName: 'Strange',
        cashier: 'Cathy',
        employeeID: 'e0921',
        services: [
          {
            description: 'X-ray',
            price: 2000,
            qty: 1,
            totalPrice: 2000
          }
        ],
        items: [
          {
            productNumber : "nu12p3445lus",
            productName : "Nutroplus",
            productId : "61925b98e2efb885e9f112b8",
            tagId : "618e9e81942a7bd15779e4ec",
            qty : 3,
            price : 1000,
            totalPrice : 3000
          }
        ]
      };

      const response = await request(server).post('/api/clinic/invoices').send(invoice);

      expect(response.status).toBe(400);
    });


    it ('should return 400 if there is an invalid data in the list', async () => {
      const invoice = {
        invoiceNumber: '20210912100428345',
        changeAmount: 100,
        givenAmount: 2500,
        payableAmount: 2400,
        patientID: 'p021',
        patientName: 'Amy',
        doctorID: 'd0321',
        doctorName: 'Strange',
        cashier: 'Cathy',
        employeeID: 'e0921',
        services: [
          {
            description: 'X-ray',
            price: 2000,
            qty: 1,
            totalPrice: 2000
          }
        ],
        items: [
          {
            productNumber : "wrongProductNumber",
            productName : "Nutroplus",
            productId : "61925b98e2efb885e9f112b8",
            tagId : "618e9e81942a7bd15779e4ec",
            qty : 3,
            price : 1000,
            totalPrice : 3000
          }
        ]
      };

      const response = await request(server).post('/api/clinic/invoices').send(invoice);

      expect(response.status).toBe(400);
    });

  });

});
