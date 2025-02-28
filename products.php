<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include 'config.php'; // Include database connection

// Fetch products with varieties
$sql = "SELECT p.id, p.name, p.category, p.image_url, v.id as variety_id, v.name as variety_name, v.price 
        FROM products p
        LEFT JOIN product_varieties v ON p.id = v.product_id";
$result = $conn->query($sql);

$products = [];
while ($row = $result->fetch_assoc()) {
    $productId = $row["id"];

    // Check if the product already exists in the array
    if (!isset($products[$productId])) {
        $products[$productId] = [
            "id" => $productId,
            "name" => $row["name"],
            "category" => $row["category"],
            "image_url" => $row["image_url"],
            "varieties" => []
        ];
    }

    // Add variety details
    $products[$productId]["varieties"][] = [
        "id" => $row["variety_id"],
        "name" => $row["variety_name"],
        "price" => $row["price"]
    ];
}

// Convert associative array to indexed array
$products = array_values($products);
echo json_encode($products);

$conn->close();
?>
