const {app, express, dotenv, nodemailer, mysql, sqlmap, multer, createHmac, session } = require("../configs/server")



module.exports = {
 
admin_logger: (req, res)=>{

    const {hashUsername, hashPassword}= req.body;
    const hashPassword__= createHmac('md5', 'pipilikapipra').update(hashPassword).digest('hex');

    sqlmap.query("SELECT * FROM user_admin WHERE domain =? AND hash_username =? AND hash_password =?",
      [res.locals.hostname, hashUsername, hashPassword__],
     (err, info)=>{

        if(info.length>0){
          
            if(info[0].hash_username==hashUsername && info[0].hash_password==hashPassword__){
                 
                req.session.hashUser= 'hashAdmin'
                req.session.admin_uuid= info[0].admin_uuid;
                req.session.hashUsername= hashUsername;
                req.session.hashPassword= hashPassword__;
                req.session.userAccess= "privet";
                res.send({status: 200, route: '/admin/dashboard/', alert: 'alert-success', msg: 'Sign in successfully!'})

            }

            else res.send({status: 503, alert: 'alert-warning', msg: 'Detect some issue, please clear browser cookie and try again!'})

            }
        

        else res.send({status: 404, alert: 'alert-info', msg: 'Authentication failed!'})


    })
},


dashboard: (req, res)=>{
  res.render("admin/dashboard")
}

,

self_account: (req, res)=>{

  
      sqlmap.query('SELECT * FROM user_admin WHERE domain=?', [res.locals.hostname], (err, info)=>{
  
        if(info.length>0){
          res.render("admin/account_page", {info,  msg: req.flash("msg"), alert: req.flash("alert")})
        } else {
          res.redirect('/pages/404.html')
        }
  
  
      })
  


}
,




self_info_update: (req, res) =>{
  
  let {hash_name}= req.body;
  sqlmap.query('UPDATE user_admin SET hash_name=? WHERE domain=?',[hash_name, res.locals.hostname], (err, info)=>{
  
  if(err) console.log(err.sqlMessage);
  
  else {
  req.flash("msg", "Profile Updated Successfully!")
  req.flash("alert", "success")
  res.redirect("/admin/account")
  }
  
  
  })
  
  },
  
  
  
  
  

  
  
self_password_update: (req, res)=>{
  
    let {hash_password, pastPassword}= req.body;

      const hashPassword= createHmac('md5', 'pipilikapipra').update(hash_password).digest('hex');  
      const pastHashPassword= createHmac('md5', 'pipilikapipra').update(pastPassword).digest('hex');  
    
       sqlmap.query(`SELECT hash_password FROM user_admin WHERE domain=?`, [res.locals.hostname], (errPass, infoPass)=>{
    
        if(errPass) console.log(errPass.sqlMessage);
        else{
    
          if( pastHashPassword==infoPass[0].hash_password)
    {
    
      sqlmap.query( `UPDATE user_admin SET hash_password=? WHERE domain=?`, [hashPassword, res.locals.hostname], (err, info) =>{
    
        if(err) 
        {
          req.flash("msg", "Change Failed!")
          req.flash("alert", "danger")
          res.redirect("/admin/account")
    
        }
    
        else
        {
        
          req.flash("msg", "Changed! Successfully...")
          req.flash("alert", "success")
          res.redirect("/admin/account")
        }
      })
    
    }
    
    else 
    {
      req.flash("msg", "Current Password Not Matched!")
      req.flash("alert", "danger")
      res.redirect("/admin/account")
    }
    
        }
    
       })
    

  
  

  
    },
  
  
  
  
  
  
  
self_email_update: (req, res)=>{
  
  sqlmap.query(`UPDATE user_admin SET hash_username=? WHERE domain=?`, [req.body.hash_username, res.locals.hostname], (err, info) =>{
  
  if(err) 
  {
    req.flash("msg", "Something Wrong!")
    res.redirect("/admin/account")
  
  }
  
  else
  {
  
    req.flash("msg", "Changed! Successfully...")
    req.flash("alert", "success")
    res.redirect("/admin/account")
  }
  })
  

  
  }
  



}






