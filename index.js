const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");
const data = fs.readFileSync(__dirname + "/dev-data/data.json", "utf-8");
const templateCard = fs.readFileSync(__dirname + "/templates/card.html", "utf-8");
const templateProduct = fs.readFileSync(__dirname + "/templates/product.html", "utf-8");
const templateOverview = fs.readFileSync(__dirname + "/templates/overview.html", "utf-8");
const dataObj = JSON.parse(data);
const PORT = process.env.PORT || 9009;
const insertTemplates = (product, temp) => {
    let output = temp.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    const slug = slugify(product.productName, {
        lower: true,
    });
    output = output.replace(/{%SLUG%}/g, slug);
    if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");

    return output;
};
const server = http.createServer((req, res) => {
    const product = dataObj.find(
        (el) => slugify(el.productName, { lower: true }) === req.url.split("/")[1]
    );

    if (req.url === "/") {
        const cards = dataObj.map((el) => insertTemplates(el, templateCard)).join("");

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(templateOverview.replace(/{%CARDS%}/g, cards));
    } else if (req.url === "/" + slugify(product.productName, { lower: true })) {
        const productHtml = insertTemplates(product, templateProduct);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(productHtml);
    } else if (req.url === "/api") {
        res.writeHead(200, {
            "Content-Type": "application/json",
        });
        res.end(data);
    } else {
        res.writeHead(302, { Location: "/" });
        res.end();
    }
});

server.listen(PORT, () => {
    console.log("Server listening...");
});
