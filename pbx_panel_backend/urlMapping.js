/**
 * @swagger
 * definition:
 *   publishers:
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       age:
 *         type: integer
 *       sex:
 *         type: string
 */

 /**
 * @swagger
 * /publisher/getPublishers:
 *   get:
 *     tags:
 *       - users
 *     description: Returns all publishers
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of publishers
 *         schema:
 *           $ref: '#/definitions/publishers'
 */



 
