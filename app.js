const express=require('express')
const bodyparser=require('body-parser');
// const { stat } = require('fs');
const mongoose=require("mongoose")

const app=express()

app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-skuk:sk123456@cluster0.ayvcg.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemschema={
    name:String
};

const Item=mongoose.model('Item',itemschema)

const item1=new Item({
    name:"welcome to your todolisyt"
});
const item2=new Item({
    name:"hit the button + to add new item"
});
const item3=new Item({
    name:"hit -- to delete the added item"
});

const defaultitem=[item1,item2,item3];

// Item.insertMany(defaultitem,function(err){
//     if(err){
//             console.log(err);
//     }
//     else{
//             console.log("successfully saved default item into DB");
//     }
// });


app.get("/",(req,res)=>{

    // res.render('list', {title : "todo",newlistitem:defaultitem});

Item.find({},function(err,foundItems){
    // console.log(foundItems);
    if(foundItems.length===0){
        Item.insertMany(defaultitem,function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("successfully saved default item into DB");
        }
    });
    res.redirect("/");
    }
    else{
        res.render('list', {title : "todo",newlistitem:foundItems});
    }
})  
})

const listschema={
    name:String,
    items:[itemschema]
}

const List=mongoose.model("List",listschema);

app.get("/:chk",function(req,res){
    // console.log(req.params.chk);
    const cuslist=req.params.chk;

List.findOne({name:cuslist},function(err,foundList){
    if(!err){
        if(!foundList){
            // console.log("DNE")
            const list=new List({
                name:cuslist,
                items:defaultitem
            });
            list.save();
            res.redirect("/"+cuslist);

        }
        else{
            // console.log("E")
            res.render("list",{title : foundList.name,newlistitem:foundList.items})
        }
    }
})

})

app.post("/",(req,res)=>{
    const itemname=req.body.newitem;
    const listname=req.body.list;
//creating a ducument og module Item
    const item = new Item({
      name:itemname
    })
   if(listname==="todo"){

       item.save();
       res.redirect("/")
    }else{
        List.findOne({name:listname},function(err,foundlist){
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/"+listname)
        })
    }

})
app.post("/delete",(req,res)=>{
    // console.log(req.body.delitem);
    const chk=req.body.delitem;
    const listname=req.body.listname;

    if(listname==="todo"){ 
        Item.findByIdAndRemove(chk,function(err){
            if(!err){
                console.log("item removed successfully");
            }
        });
        res.redirect("/");
    }
    else{
        List.findByIdAndUpdate(
            
            {name:listname},
            {$pull:{items:{_id:chk}}},
            function(err,foundList){
            if(!err){
                console.log("item removed successfully");
                
                res.redirect("/"+foundList);
            }
        });
    }
    
})

app.listen(4000,()=>{
    console.log("your server is now running at port 4000")
})