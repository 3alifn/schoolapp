const express = require('express');
const app = express();
const { sqlmap, multer, randomBytes, createHmac, path, fs } = require('../server');
const { json } = require('body-parser');
const sharp = require("sharp")


const multer_location = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/image/default/")
    },

    filename: (req, file, cb) => {

        cb(null, new Date().getTime() + "_" + file.originalname)
    },

})


module.exports = {
    multer_upload_school_settings: multer({
        storage: multer_location,

        limits: { fileSize: 1024 * 1024 * 2 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpeg") {
                cb(null, true)
            }
            else {
                cb(new Error("file extension allow only png or jpeg"))
            }

        }

    }),


    pu_school_info_get: (req, res) => {

        sqlmap.query(`SELECT * FROM school_settings ORDER BY ID DESC LIMIT 1`, (err, info) => {
            if (err) console.log(err.sqlMessage);
            else res.send({ info })
        })

    },

    admin_school_page: (req, res) => {

        sqlmap.query(`SELECT * FROM school_settings ORDER BY ID DESC LIMIT 1`, (err, info) => {
            if (err) console.log(err.sqlMessage);
            else res.render('admin/school_page', { info })
        })



    },

    admin_school_post: (req, res) => {
        const { eiin, name, email, phone, address, headline, about, fb_link } = req.body;
        sqlmap.query(`SELECT * FROM school_settings ORDER BY ID DESC LIMIT 1`, (errHave, infoHave) => {
            if (errHave) console.log(errHave.sqlMessage);
            if (infoHave.length == 0 || infoHave == undefined) {

                sqlmap.query(`INSERT INTO school_settings (eiin, name, email, phone, address, headline, about, fb_link)
                VALUES( '${eiin}', '${name}','${email}', '${phone}', '${address}', '${headline}', '${about}', '${fb_link}')`, (err, next) => {
                    if (err) console.log(err.sqlMessage);
                    else res.send({ msg: 'Updated' })

                })


            } else {
                sqlmap.query(`UPDATE school_settings SET eiin='${eiin}', name='${name}', about="${about}", fb_link='${fb_link}', 
                headline='${headline}', address='${address}', email='${email}', phone='${phone}'`, (err, next) => {
                    if (err) console.log(err.sqlMessage);
                    else res.send({ msg: ' Updated' })
                })
            }

        })


    },

    admin_school_img_post: async (req, res) => {
        const jsondata = (JSON.stringify(req.body));
        const imgrole = JSON.parse(jsondata).imgrole;
        //   console.log(imgrole, JSON.parse(jsondata).image);

        if (req.file.size < 524288) {

            await sharp(req.file.path)
                .jpeg({ quality: 50 })
                .toFile(
                    path.resolve(path.resolve(req.file.destination, 'resized', imgrole + '.png'))
                )

            fs.unlinkSync(req.file.path)


        }


        else {
            await sharp(req.file.path)
                .jpeg({ quality: 20 })
                .toFile(
                    path.resolve(path.resolve(req.file.destination, 'resized', imgrole + '.png'))
                )

            fs.unlinkSync(req.file.path)


        }

        //  const randomString= Math.random()*900000000;

        // sqlmap.query(`UPDATE school_settings SET  ${imgrole}='${imgrole+'.png'}'`, (err, next)=>{
        //     if(err) console.log(err.sqlMessage);

        // })

        res.send({ msg: "Added Successfully!", alert: "success" })
    },


}