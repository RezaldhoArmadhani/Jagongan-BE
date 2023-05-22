const {
  selectAllUser,
  selectUserId,
  updateUser,
  deleteUser,
  countData,
  findId,
  registerUser,
  findEmail,
  getAllUser,
} = require("../model/users");

const { getLastMessage } = require("../model/chat");
const commonHelper = require("../helper/common");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const authHelper = require("../helper/AuthHelper");
const jwt = require("jsonwebtoken");
const { uploadPhotoCloudinary } = require("../../cloudinary");

const userController = {
  getAllUser: async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const offset = (page - 1) * limit;
      let sortBY = req.query.sortBY || "id_user";
      let sort = req.query.sort || "ASC";
      let searchParam = req.query.search || "";

      const { id: sender_id } = req.payload;
      const result = await selectAllUser(
        limit,
        offset,
        searchParam,
        sortBY,
        sort
      );
      const { rows } = result;
      filtered = rows.filter((data) => data.id !== sender_id);
      const detailPerUser = filtered.map(async (data) => {
        const {
          rows: [last],
        } = await getLastMessage(data.id_user, sender_id);
        if (last) {
          data.lastMessage = last.body;
          data.lastTime = last.time;
          console.log(data.lastMessage);
        } else {
          data.lastMessage = "Let's get in touch!";
          data.lastTime = "1658822941";
          console.log(data.lastMessage);
        }
        return data;
      });

      const results = await Promise.all(detailPerUser);
      const newData = results?.map((data) => {
        const date = new Date(data.lastTime * 1000);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        data.lastTime = hours + ":" + minutes;
        return data;
      });

      const {
        rows: [count],
      } = await countData();
      const totalData = parseInt(count.count);
      const totalPage = Math.ceil(totalData / limit);
      const pagination = {
        currentPage: page,
        limit: limit,
        totalData: totalData,
        totalPage: totalPage,
      };

      commonHelper.response(res, newData, 200, "get data success", pagination);
    } catch (error) {
      console.log(error);
    }
  },

  // getAllUser: async(req, res) => {
  //   const search = req.query.search || null
  //   try {
  //     const { id: sender_id } = req.payload
  //     const { rows } = await getAllUser()
  //     const filtered = rows.filter((data) => data.id !== sender_id)
  //     const detailPerUser = filtered.map(async (data) => {
  //         const { rows: [last] } = await getLastMessage(data.id_user , sender_id)
  //         if(last){
  //             data.lastMessage = last.body
  //             data.lastTime = last.time
  //         }else{
  //             data.lastMessage = "Say Hai !!!"
  //             data.lastTime = '1658822941'
  //         }
  //         return data
  //         // console.log(last);
  //       })

  //     const result = await Promise.all(detailPerUser)
  //     const newData = result.map((data) => {
  //         const date = new Date(data.lastTime * 1000)
  //         const hours = date.getHours()
  //         const minutes = date.getMinutes()
  //         data.lastTime = hours+':'+minutes
  //         return data
  //       })
  //     if(search){
  //         const veryNewData = newData.filter(data => data.fullname.toLowerCase().includes(search.toLowerCase()))
  //         return commonHelper.response(res, veryNewData, 200, "get profile success")
  //     }
  //     commonHelper.response(res, newData, 200, "get profile success")
  // } catch (error) {
  //     console.log(error)
  // }

  // },

  getProfile: async (req, res) => {
    try {
      const { email } = req.payload;
      const {
        rows: [data],
      } = await findEmail(email);
      if (!data) {
        return commonHelper.response(res, [], 304, "get profile failed");
      }
      delete data.password;
      commonHelper.response(res, data, 200, "get profile success");
    } catch (error) {
      console.log(error);
      commonHelper.response(res, null, 500, "Error");
    }
  },

  getDetailUser: async (req, res) => {
    const id = req.params.id;
    const { rowCount } = await findId(id);
    if (!rowCount) {
      return res.json({ message: "ID is Not Found" });
    }
    selectUserId(id)
      .then((result) => {
        commonHelper.response(res, result.rows, 200, "get data success");
      })
      .catch((err) => res.send(err));
  },

  updateUser: async (req, res) => {
    const id = req.params.id;
    const userId = req.payload.id;
    const { username, fullname, phone, photo, bio } = req.body;
    const { rowCount } = await findId(id);

    const oldDataResult = await selectUserId(id);
    const oldData = oldDataResult.rows[0];
    console.log(oldData);

    if (id !== userId) {
      return commonHelper.response(
        res,
        null,
        401,
        "You are not authorized to edit this profile"
      );
    }
    if (!rowCount) return res.json({ message: "User Not Found!" });

    const data = {
      id,
      username,
      fullname,
      phone,
      bio,
    };

    console.log(data);

    // console.log(req.file);

    if (req.file) {
      const upload = await uploadPhotoCloudinary(req.file.path);
      data.photo = upload.secure_url || url;
      console.log(data.photo);
    } else {
      data.photo = oldData.photo;
      console.log(data.photo);
    }

    console.log(data);
    updateUser(data)
      .then((result) => {
        commonHelper.response(res, result.rows, 201, "Data User Updated!");
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;
      const { rowCount } = await findId(id);
      const role = req.payload.id;

      if (role !== id)
        return res.json({ message: "Permission denied, token not match" });

      if (!rowCount) {
        return res.json({ message: "ID is Not Found" });
      }
      deleteUser(id)
        .then((result) =>
          commonHelper.response(res, result.rows, 200, "User deleted")
        )
        .catch((err) => res.send(err));
    } catch (error) {
      console.log(error);
    }
  },

  registerUser: async (req, res) => {
    try {
      const { username, fullname, email, phone, password, photo, bio } =
        req.body;
      const { rowCount } = await findEmail(email);
      if (rowCount)
        return commonHelper.response(res, null, 409, "Email already exist");

      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      const id = uuidv4();

      const data = {
        id,
        username,
        fullname,
        email,
        phone,
        password: passwordHash,
        photo,
        bio,
      };

      registerUser(data)
        .then((result) => {
          commonHelper.response(res, result.rows, 201, "Data User Created");
        })
        .catch((error) => {
          res.send(error);
        });
    } catch (err) {
      console.log(err);
      return commonHelper.response(res, null, 500, "Failed to register");
    }
  },

  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      const {
        rows: [user],
      } = await findEmail(email);
      if (!user)
        return commonHelper.response(res, null, 401, "Email is invalid");
      const validatePassword = bcrypt.compareSync(password, user.password);
      if (!validatePassword)
        return commonHelper.response(res, null, 401, "Password is invalid");
      delete user.password;
      let payload = {
        email: user.email,
        id: user.id_user,
        type: "access-token",
      };
      user.token = authHelper.generateToken(payload);
      user.refreshToken = authHelper.generateRefreshToken(payload);
      commonHelper.response(res, user, 201, "Login Successfull");
      console.log(user);
    } catch (error) {
      console.log(error);
      return commonHelper.response(res, null, 500, "Failed to login");
    }
  },

  refreshToken: (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;
      let decode = jwt.verify(refreshToken, process.env.SECRETE_KEY_JWT);

      const payload = {
        email: decode.email,
        role: decode.role,
      };

      const result = {
        token: authHelper.generateToken(payload),
        refreshToken: authHelper.generateRefreshToken(payload),
      };

      commonHelper.response(res, result, 200);
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = userController;
