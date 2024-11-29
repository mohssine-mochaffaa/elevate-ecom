const mysql = require('mysql2');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { query } = require('express');

dotenv.config(); 

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    timezone:"+00:00"
}).promise();


const adminLogin=async(userName,password)=>{
    const [result] = await pool.query(`SELECT * FROM admin WHERE userName = ? AND password = ? `,[userName,password]);
    return result;
}

const uploadCategorie = async(name,tags,image)=>{
    const code = uuidv4();

    const [result] = await pool.query("INSERT INTO categories (name,tags, image,code) VALUES (?,?, ?,?)",[name,tags,image,code]);
    return result;
};

const uploadProducts = async(name,description,price,stock,image,code)=>{

    const [result] = await pool.query("INSERT INTO products (name,description,price,stock,image,code,date) VALUES (?,?,?,?,?,?,CURDATE())",[name,description,price,stock,image,code]);
    const [result2] = await pool.query("SELECT products_number FROM categories WHERE code = ?" , [code]);
    let number = Number(result2[0].products_number);
    number++;
    const result3 = await pool.query("UPDATE categories SET products_number = ? WHERE code = ?",[number,code]);
    return result;
};

const updateProducts = async(name,description,price,stock,image,code,id)=>{
    const fieldsToUpdate = [];
    const values = [];
    if (name) {
        fieldsToUpdate.push("name = ?");
        values.push(name);
      }
      if (description) {
        fieldsToUpdate.push("description = ?");
        values.push(description);
      }
      if (price) {
        fieldsToUpdate.push("price = ?");
        values.push(price);
      }
      if (stock) {
        fieldsToUpdate.push("stock = ?");
        values.push(stock);
      }
      if (image) {
        fieldsToUpdate.push("image = ?");
        values.push(image);
      }
      values.push(code);
      values.push(id);

      
    const [result] = await pool.query(`UPDATE products SET ${fieldsToUpdate.join(", ")} WHERE code = ? AND id = ?`,values);

    return result;
};
 
const updateCategories = async(name,tags,image,code,id)=>{
    const fieldsToUpdate = [];
    const values = [];
    if (name) {
        fieldsToUpdate.push("name = ?");
        values.push(name);
      }
      if (tags) {
        fieldsToUpdate.push("tags = ?");
        values.push(tags);
      }
      if (image) {
        fieldsToUpdate.push("image = ?");
        values.push(image);
      }
      values.push(code);
      values.push(id);

      
    const [result] = await pool.query(`UPDATE categories SET ${fieldsToUpdate.join(", ")} WHERE code = ? AND id = ?`,values);

    return result;
};
 


const getCategories=async()=>{
    try {
        const [results] = await pool.query("SELECT * FROM categories");
    
        const categoriesWithImages = await results.map(category => {
          const base64Image = category.image ? `data:image/jpeg;base64,${category.image.toString('base64')}` : null;
          return { ...category, image: base64Image };
        });
    
        return categoriesWithImages;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error; 
      }
}

const getProducts=async(req)=>{
  const baseUrl = `${req.protocol}://${req.get('host')}/images/`;

    try {
        const [results] = await pool.query("SELECT * FROM products");
    
        const products = results.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          date:product.date,
          stock:product.stock,
          code:product.code,
          imageUrl: baseUrl + product.image, // Full URL for the image
        }));
        
        /*
        const productsWithImages = results.map(product => {
          const base64Image = product.image ? `data:image/jpeg;base64,${product.image.toString('base64')}` : null;
    
          return { ...product, image: base64Image };
        }); 
        */
    
        return products;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error; // Or return an empty array or error response as needed
      }
}


const getNewProducts=async()=>{
    try {
        const [results] = await pool.query("SELECT * FROM products ORDER BY id DESC LIMIT 6");
    
        const categoriesWithImages = results.map(product => {
          const base64Image = product.image ? `data:image/jpeg;base64,${product.image.toString('base64')}` : null;
    
          return { ...product, image: base64Image };
        });
    
        return categoriesWithImages;
      } catch (error) {
        console.error('Error fetching products:', error);
        throw error; // Or return an empty array or error response as needed
      }
}

const deleteProduct=async(code,id)=>{

    const [result] = await pool.query("DELETE FROM products WHERE code = ? AND id = ?",[code,id]);
    const [result2] = await pool.query("SELECT products_number FROM categories WHERE code = ?" , [code]);
    console.log(result2);

    let number = Number(result2[0].products_number);
    number--;
    const result3 = await pool.query("UPDATE categories SET products_number = ? WHERE code = ?",[number,code]);

    return result;
}

const deletecategorie=async()=>{
  const [result] = await pool.query("DELETE FROM categories WHERE code = ? AND id = ?",[code,id]);

}

module.exports={adminLogin,uploadCategorie,getCategories,uploadProducts,getProducts,getNewProducts,updateProducts,deleteProduct,updateCategories,deletecategorie}
