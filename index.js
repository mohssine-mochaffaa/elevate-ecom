const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');


const { adminLogin,uploadCategorie,getCategories,uploadProducts,getProducts,getNewProducts,updateProducts,deleteProduct,updateCategories,deletecategorie} = require("./database");

const port = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, (uniqueSuffix+file.originalname));
  }
})

const upload = multer({storage});

app.post("/adminLogin",async(req,res)=>{
    const {userName,password} = req.body;
    const result = await adminLogin(userName,password); 

    if (result.length > 0) {
          res.send("logged");
    }else{
        res.send("not logged");
    }
});

app.post('/uploadCategorie', upload.single('image'), async(req, res) => {
    const { name,tags } = req.body;
    const image = req.file.buffer; // Image file as binary

    const result = await uploadCategorie(name,tags,image);

    res.send("added");
  });

  app.post('/uploadProduct', upload.single('image'), async(req, res) => {
    const { name,description,price,stock,code} = req.body;
    const image = req.file.filename; // Image file as binary
  
    const result = await uploadProducts(name,description,price,stock,image,code);

    res.send("added"); 
  
  }); 


  app.put('/updateProduct', upload.single('image'), async(req, res) => {
    const { name,description,price,stock,code,id} = req.body;
    const image = req?.file?.buffer; // Image file as binary

    console.log(name)
    console.log(description)
    console.log(price)
    console.log(stock)
    console.log(code)
    console.log(id)

    const result = await updateProducts(name,description,price,stock,image,code,id);

    res.send("updated"); 
  });

  app.put('/updateCategorie', upload.single('image'), async(req, res) => {
    const { name,tags,code,id} = req.body;
    const image = req?.file?.buffer; // Image file as binary
 
    const result = await updateCategories(name,tags,image,code,id);

    res.send("updated"); 
  });


  app.delete("/deleteProduct/:code/:id",async(req,res)=>{
    const {code,id} = req.params;

    const result = await deleteProduct(code,id);
    res.send("deleted");
  });

  app.delete("/deleteCategorie/:code/:id",async(req,res)=>{
    const {code,id} = req.params;

    const result = await deletecategorie(code,id);
    res.send("deleted");
  });

  app.get('/getCategories', async(req, res) => {
    const result = await getCategories();
    res.send(result);
  });

  app.get('/getProducts', async(req, res) => {
    const result = await getProducts(req);
    console.log(result);
    res.send(result);
  });
  
  app.get('/getNewProducts', async(req, res) => {
    const result = await getNewProducts();
    res.send(result);
  });
  


app.listen(port,()=> { 
    console.log("server running on port: " + port);  
  });
  
