const Admin_col = require('../server/models/admin.js');
const Food = require('./models/food.js');
const Inventory = require('./models/inventory.js');
const Notification_col = require('../server/models/notification.js');
const MC_employees = require('../server/models/microchip_employees.js');
const Reports = require('../server/models/reports.js');

var nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "rapshek@gmail.com", // generated ethereal user
        pass: "logical007" // generated ethereal password
    },
    tls:{
        rejectUnauthorized:false
    }
});
var fs = require('fs');
var path = require('path');
var formidable = require('formidable');
module.exports = function(app){

    app.get('/', function(req, res){
        if(req.cookies.admin){
            res.redirect("/admin");
        }
        
        else{
          //  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('index');
        }
       
    });
    app.get('/counter', function(req, res){
        if(req.cookies.admin){
            Food.find({},(err,foods)=>{
                res.render("counter",{foods:foods});

            })
        }
        
        else{
          //  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('index');
        }
       
    });
    app.get("/inventory",(req,res)=>{
        Inventory.find({},(err,inventorys)=>{
            res.json({inventorys:inventorys});
            res.end();
        })
    })

  
     
 ///// admin portal
 app.get("/admin",(req,res)=>{
    
     if(req.cookies.admin){
        


                 Food.find({},(err,foods)=>{
                    Notification_col.find({to:'admin'},(err,notifications)=>{
                        MC_employees.find({},(err,mc_employees)=>{
                            
                             Reports.find({},(err,reports)=>{

                                
                                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                                res.render("admin/index",{foods:foods,notifications:notifications,mc_employees:mc_employees,reports:reports});

                            })
                           

                        });
            })
         })
           
    
          
     }
     else{
         res.redirect("/");
     }
 });
 app.get('/admin/notifications',(req,res)=>{
     Notification_col.find({to:'admin'},(req,notifications)=>{
         res.json({notifications:notifications});
     })
 });

 app.post('/admin/add_employee',(req,res)=>{
    let form = new formidable.IncomingForm();
      
    form.parse(req,(err,fields,files)=>{
        let name = fields.name;
        let phone = fields.phone;
        let cnic = fields.cnic;
        let role = fields.role;
        let father_name = fields.father_name;
        let address = fields.address;
        console.log("check:");

        let unique =  Math.floor((Math.random()*100000)+(Math.random()*100000));
        var oldpath = files.pic.path;
        var path_new =path.join(__dirname ,"../client/public/content/pics/",unique+"_"+files.pic.name);
        var db_path = path.join("./content/pics/",unique+"_"+files.pic.name);
        let employee_obj = {'name':name,'phone':phone,'cnic':cnic,'pic':db_path,'father_name':father_name,'address':address,'role':role};
        console.log("employee obj:",employee_obj);

       
            fs.copyFile(oldpath,path_new,(err)=>{
                if(err){
                    throw err
                }
                fs.unlink(oldpath,(err_4)=>{
                    if(err_4){
                        throw err_4
                    }
                   
                })
            })
           new MC_employees(employee_obj).save((err,employee)=>{
            res.redirect('/admin');
           })
        })

  
  });
  app.post('/admin/add_food',(req,res)=>{
    let form = new formidable.IncomingForm();
      
    form.parse(req,(err,fields,files)=>{
        let name = fields.name;
        let category = fields.category;
        let price = fields.price;
        let raw_list = fields.raw_list;
        let unique =  Math.floor((Math.random()*100000)+(Math.random()*100000));
        var oldpath = files.pic.path;
        var path_new =path.join(__dirname ,"../client/public/content/pics/",unique+"_"+files.pic.name);
        var db_path = path.join("./content/pics/",unique+"_"+files.pic.name);
        let food_obj = {'name':name,'price':price,'category':category,raw_items:raw_list,'pic':db_path};
            fs.copyFile(oldpath,path_new,(err)=>{
                if(err){
                    throw err
                }
                fs.unlink(oldpath,(err_4)=>{
                    if(err_4){
                        throw err_4
                    }
                   
                })
            })
           new Food(food_obj).save((err,food)=>{
            console.log("food:",food);   
            res.redirect('/admin');
           })
        })

  
  })
  app.post('/admin/add_raw_item',(req,res)=>{
let name =req.body.name;
let unit = req.body.unit;
let threshold = req.body.threshold;
let obj = {name:name,unit:unit,threshold:threshold,value:0};
new Inventory(obj).save((err,raw)=>{
    if(err){throw err};
    console.log(raw);
    res.redirect('/');
})      
   
  })
 app.post('/admin/login',(req,res)=>{
    let username = req.body.username;
    let password = req.body.password;
    console.log(username + password);
    Admin_col.find({username:username,password:password},(err,admin)=>{
        if(err){throw err};
     if(admin[0]===undefined){
        res.redirect("/");
     }
     else{
        res.cookie("admin",JSON.stringify(admin[0]),{maxAge:1000*60*60*24*7});
        res.redirect('/admin');
     }
    
    })
 });
 app.post('/admin/add_inventory',(req,res)=>{
    let name = req.body.name;
    let value = req.body.value;
            Inventory.findOne({name:name},(err,inventory,resp)=>{
            if(err){throw err};
            const old_value = inventory.value;
            inventory.value = parseInt(old_value) + parseInt(value);
            inventory.save((err2,inventory_)=>{
                if(err2){throw err2};
                res.json({success:true,inventory:inventory_});
                res.end();
            })
           
          
        });
     

    
 });
 function reporting(sale){
  let t_date = new Date().getDate() , t_utc = new Date().getTime(),
  t_month = new Date().getMonth() + 1 , t_year = new Date().getFullYear();
  
  console.log(t_date+"/"+t_month+"/"+t_year);
  Reports.findOne({date:t_date,month:t_month,year:t_year},(err,report)=>{
      if(report===null){
          console.log("creating new field");
          new Reports({date:t_date,month:t_month,year:t_year,utc:t_utc,sales:parseInt(sale)}).save((err,report)=>{
              console.log(report);
          })
      }
      else{
        console.log("updating");

          Reports.findOne({date:t_date,month:t_month,year:t_year},(err,report)=>{
              report.sales = parseInt(sale) + report.sales;
              report.save((err,report)=>{
                console.log("report:",report);

              })
          })
      }
  })

 }
 app.post('/generate_bill',(req,res)=>{
     let items_list = JSON.parse(req.body.items_list);
     let total =  req.body.total ; 
     res.end();
     reporting(total);
     let name ,raw_items=[] ,ded_q,q,parsed_raw=[],dummy_arr=[];
    // console.log("hurray you made this far:",total);
   // console.log(req.body.items_list);
    ///
       items_list.forEach((item,index)=>{
        Food.findOne({name:item.name},(err,food)=>{
           console.log("quantity",item.quantity);
           console.log(JSON.stringify(food));
               parsed_raw =  JSON.parse(food.raw_items);
               console.log('parsed',parsed_raw);
                parsed_raw.forEach((raw)=>{
                    // [ [ 'chicken', 0.30000000000000004 ],
                    // [ 'Canola Oil', 0.07500000000000001 ],
                    // [ 'Buns', 3 ],
                    // [ 'Beef Meat', 1.2 ],
                    // [ 'Buns', 6 ] ]
                     raw.quantity = raw.quantity * item.quantity;
                    dummy_arr.push([raw.item,raw.quantity]);
                     
                 });

          // raw_items.push(parsed_raw);
        }).then(()=>{
           // console.log("final result",JSON.stringify(raw_items));
            console.log('dummy_Arr :',dummy_arr);
            dummy_arr.forEach(dummy=>{
                Inventory.findOneAndUpdate({name:dummy[0]},{$inc:{value:(-1*dummy[1])}},(err,inven)=>{
                    console.log(inven.name + "----" + inven.value);
                })
            })
        })
    })
   
 })
 app.post('/admin/settings',(req,res)=>{
    let pwd_old = req.body.pwd_old;
    let pwd_new = req.body.pwd_new;
    let obj = {'password':pwd_new};
    let admin_id = JSON.parse(req.cookies.admin)._id;   
        Admin_col.findOneAndUpdate({_id:admin_id,password:pwd_old},{$set:{password:pwd_new}},(err,admin,resp)=>{
            if(err){throw err};
            if(admin === null){
                res.json({"success":false});
                res.end();
              //  res.redirect('/logout')
            }
            else{
                console.log("checked admin:",admin);
          //  res.redirect("/admin");
            res.json({"success":true});
                res.end();
            }
            
        });
     

    
 })
 app.get('/logout',(req,res)=>{
    res.clearCookie("admin");
    res.redirect("/");
 })  
 app.get('/notifications/read/:id',(req,res)=>{
     let id = req.params.id;
     Notification_col.findByIdAndUpdate(id,{$set:{flag:'read'}},(err,resp)=>{
         res.json({success:true});
     })
 });
 app.post('/send_notice',(req,res)=>{
     if(req.cookies.admin || req.cookies.manager){
         let from="Falcon Mart Manager";
         if(req.cookies.admin){
           from = "Microchip Admin"
         }
         
        let title= req.body.title;
     let detail = req.body.detail;
     let shop_id = req.body.shop_id;
     new Notification_col({
         title:title,
         detail:detail,
         to:shop_id,
         from:from,
         date:new Date().getTime(),
         flag:'unread'
     }).save((err,resp)=>{
        res.redirect("/");
     })
     }
     else{
         res.redirect("/");
     }
     

 })
 app.post('/manager/add_shop',(req,res)=>{
    let name = req.body.name;
    let number = req.body.number;
    let type = req.body.type;
    let phone = req.body.phone;
    let owner = req.body.owner_name;
    let email = req.body.email;
    let manager_id = JSON.parse(req.cookies.manager)._id;
    let manager_name = JSON.parse(req.cookies.manager).name;

  
    let shop_obj = {name:name,phone:phone,shop_number:number,owner_name:owner,email:email,manager_ref:manager_name,manager_ref_id:manager_id,approved_flag:'0',employee_list:"[]",last_paid:0};
   console.log("shop obj:",shop_obj);
   let notification = new Notification_col({
    title:'New Shop Added',
    detail:manager_name + ' has added a new shop of ' +name,
    to:'admin',
    date: new Date().getTime(),
    flag:'unread'
});
notification.save();
    let shop = new Shop_col(shop_obj);
    shop.save(()=>{
        res.json({success:true});
    })
 })




}