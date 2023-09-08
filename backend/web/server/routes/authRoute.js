/**
 * Module Dependencies
 */
const express = require('express');

const router = express();

// Commands
const Conductor = require('../../../services/conductor');

const { Login, Logout } = require('../../../services/StaffCommands/Auth');
const {AddNewStaff} = require('../../../services/StaffCommands/Staff');

const mongoose = require('mongoose');

// const StaffModel = require('../../../models/Staff');
const bcrypt = require('bcrypt');

const StaffClass = require('../../../lib/data-access/StaffClass/index');

module.exports = (param) => {
  const { sqlPool } = param;
  // Login route
  router.route('/login').post((req, res, next) => {
    // console.log(sqlPool, "line 17")
    return Conductor.run(new Login(req, res, sqlPool))
      .then((result) => {
        console.log(result, "result");
        const { token, user, MotelInfo, MotelRoom } = result;
        return res
          .cookie('token', token, { httpOnly: true, SameSite: 'strict' }) // Limit CSRF attacks
          .send({
            user,
            MotelInfo,
            MotelRoom,
          });
      })
      .catch((err) => {
        console.log(err)
        const error = new Error('Failed to Login');
        error.status = 400;
        return next(error);
      });
  });


  // Logout Staff
  router.route('/logout').get((req, res, next) => {
    return Conductor.run(new Logout(req, res)).catch((err) => {
      const error = new Error(err.message);
      error.status = 400;
      return next(error);
    });
  });

  router.route('/register').post(async (req, res, next) => {
    // console.log(sqlPool, "line 17")
    let NewStaffObj = req.query
    const Staff = new StaffClass(NewStaffObj.HotelID);
    // const data = new AddNewStaff(sqlPool)
 
    NewStaffObj.hashPassword = bcrypt.hashSync(
      req.query.password,
      10
    );

    // NewStaffObj.HotelID = HotelID;

    const newStaff = await Staff.createNewStaff(NewStaffObj);
    console.log(newStaff)
    if (!newStaff || newStaff.length === 0)
    throw new Error('Failed to Create New Staff');
    return res.send(newStaff[0])
      // .then((result) => {
      //   console.log(result);
      //   // const { token, user, MotelInfo, MotelRoom } = result;
      //   return res
      //     // .cookie('token', token, { httpOnly: true, SameSite: 'strict' }) // Limit CSRF attacks
      //     .send({
      //       result,
      //       // MotelInfo,
      //       // MotelRoom,
      //     });
      // })
      // .catch((err) => {
      //   const error = new Error('Failed to register');
      //   console.log(err)
      //   error.status = 400;
      //   return next(error);
      // });
  });

  return router;
};
