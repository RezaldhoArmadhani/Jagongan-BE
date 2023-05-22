const Pool = require('../config/db');

const selectAllUser = (limit, offset, searchParam,sortBY,sort) =>{
  return Pool.query(`SELECT * FROM users WHERE fullname LIKE '%${searchParam}%' ORDER BY ${sortBY} ${sort} LIMIT ${limit} OFFSET ${offset} `);
}

const getAllUser = () => {
  return Pool.query('SELECT * FROM users')
}

const selectUserId = (id) =>{
    return Pool.query(`SELECT * FROM users WHERE id_user='${id}'`);
}

const updateUser = (data) =>{
    const { id,username,fullname,phone,photo,bio} = data;
    return Pool.query(`UPDATE users SET username='${username}',fullname='${fullname}',phone='${phone}',photo='${photo}',bio='${bio}' WHERE id_user='${id}'`);
}

const deleteUser = (id) =>{
    return Pool.query(`DELETE FROM users WHERE id_user='${id}'`);
}

const countData = () =>{
    return Pool.query('SELECT COUNT(*) FROM users')
  }
  
const findId =(id)=>{
    return  new Promise ((resolve,reject)=> 
    Pool.query(`SELECT id_user FROM users WHERE id_user='${id}'`,(error,result)=>{
      if(!error){
        resolve(result)
      }else{
        reject(error)
      }
    })
    )
  }



// AUTHENTICATION

const registerUser = (data) => {
  const { id,username,fullname,email,phone,password,photo,bio} = data;
    
  return Pool.query(`INSERT INTO users(id_user,username,fullname,email,phone,password,photo,bio) VALUES('${id}','${username}','${fullname}','${email}','${phone}','${password}','${photo}','${bio}')`);
}

const findEmail = (email) => {
  return new Promise((resolve, reject) => {
      Pool.query(`SELECT * FROM users WHERE email='${email}'`, (error, result) => {
          if (!error) {
              resolve(result);
          } else {
              reject(error);
          }
      });
  });
};



module.exports = {
    selectAllUser,
    selectUserId,
    updateUser,
    deleteUser,
    countData,
    findId,
    registerUser,
    findEmail,
    getAllUser
}