Vue.createApp({
  data() {
    return {
      currentPage: "home",
      farmerProducts: [],
      loggedInUser: "",
      showAddProductForm: false,
      showEditProductForm: false,
      isLoggedIn: false,
      loginUsername: "",
      loginPassword: "",
      signupFirstName: "",
      signupLastName: "",
      signupUsername: "",
      signupEmail: "",
      signupPassword: "",
      searchQuery: "",
      products: [],
      newProduct: {
        productName: "",
        description: "",
        price: 0,
        imageURL: "",
        location: "",
        quantity: 0,
      },
      selectedProduct: null,
      selectedQuantity: "1kg",
      lastName: "",
      email: "",
      subject: "",
      message: "",
      notification: {
        message: "",
        type: "", // Can be "success", "error", or "info"
      },
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter((product) => {
        // Ensure product.productName is defined before calling toLowerCase
        if (product.productName) {
          return product.productName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());
        }
        return false; // Exclude products with undefined productName
      });
    },
  },
  methods: {
    //home
    goToHome() {
      this.currentPage = "home";
      this.selectedProduct = null;
    },

    //login
    login() {
      fetch("https://s25-midterm-project-yasli-k.onrender.com/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.loginUsername,
          password: this.loginPassword,
        }),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            this.isLoggedIn = true;
            this.loggedInUser = this.loginUsername;

            //save login state to local storage
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("loggedInUser", this.loginUsername);
            //redirect to dashboard
            this.currentPage = "dashboard";
            this.fetchFarmerProducts();
            this.showNotification("Login successful!");
          } else {
            this.showNotification("Login failed. Please try again.", "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    //signup
    signup() {
      fetch("https://s25-midterm-project-yasli-k.onrender.com/farmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: this.signupFirstName,
          lastName: this.signupLastName,
          username: this.signupUsername,
          email: this.signupEmail,
          password: this.signupPassword,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            this.showNotification("Signup failed. Please try again.", "error");
          }
        })
        .then((data) => {
          //log the farmer in after signup
          this.isLoggedIn = true;
          this.loggedInUser = data.farmer.username;
          //save login state to local storage
          localStorage.setItem("isLoggedIn", true);
          localStorage.setItem("loggedInUser", data.farmer.username);

          //redirect to dashboard
          this.currentPage = "dashboard";
          this.fetchFarmerProducts();
          this.showNotification("Signup successful!");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    //logout
    logout() {
      fetch("https://s25-midterm-project-yasli-k.onrender.com/session", {
        method: "DELETE",
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            this.isLoggedIn = false;
            this.loggedInUser = "";
            this.currentPage = "home";
            this.selectProduct = null;
            //clear login state from local storage
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            this.showNotification("Logout successful!");
          } else {
            this.showNotification("Logout failed. Please try again.", "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    // selectProduct(product) {
    //   console.log("selected product:", product);
    //   this.selectedProduct = product;
    //   this.currentPage = "selectProduct";
    //   console.log("current page:", this.currentPage);
    // },
    async selectProduct(product) {
      try {
        const response = await fetch(
          `https://s25-midterm-project-yasli-k.onrender.com/products/${product._id}`
        );
        if (response.ok) {
          const productWithOwner = await response.json();
          this.selectedProduct = productWithOwner;
          this.currentPage = "selectProduct";
        } else {
          this.showNotification("Failed to fetch product details.", "error");
        }
      } catch (error) {
        console.error("Error:", error);
        this.showNotification("An error occurred. Please try again.", "error");
      }
    },
    goBack() {
      this.selectedProduct = null;
      this.currentPage = "home";
    },
    sendRequest() {
      if (this.selectedProduct && this.selectedQuantity) {
        this.showNotification("Request sent successfully!");
      }
    },
    //fetching products
    fetchProducts() {
      fetch("https://s25-midterm-project-yasli-k.onrender.com/products").then(
        (response) => {
          response.json().then((products) => {
            console.log(products);
            this.products = products;
          });
        }
      );
    },
    //fetching farmer products
    fetchFarmerProducts() {
      fetch(
        "https://s25-midterm-project-yasli-k.onrender.com/farmer/products",
        {
          method: "GET",
          credentials: "include", // Include cookies for session authentication
        }
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to fetch products");
          }
        })
        .then((products) => {
          this.farmerProducts = products; // Store the farmer's products
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    //creating products
    addProduct() {
      fetch("https://s25-midterm-project-yasli-k.onrender.com/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.newProduct),
      })
        .then((response) => {
          if (response.ok) {
            this.showNotification("Product added successfully!");
            this.fetchProducts();
            this.newProduct = {
              productName: "",
              description: "",
              price: 0,
              imageURL: "",
              location: "",
              quantity: 0,
            };
            this.showAddProductForm = false;
            this.showNotification("Product added successfully!");
          } else {
            this.showNotification("Failed to add product.", "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    // resetProductForm() {
    //   // Reset the form fields
    //   this.newProduct = {
    //     productName: "",
    //     description: "",
    //     price: 0,
    //     imageURL: "",
    //     location: "",
    //     sellerName: "",
    //     sellerPhone: "",
    //     quantity: 0,
    //   };
    //   // Close the modal
    //   this.showAddProductModal = false;
    //   // Refresh the product list
    //   this.fetchProducts();
    //   // Show success message
    //   this.showNotification("Product added successfully!");
    // },

    //updating/editing a product
    updateProduct() {
      fetch(
        `https://s25-midterm-project-yasli-k.onrender.com/products/${this.selectedProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.selectedProduct),
        }
      )
        .then((response) => {
          if (response.ok) {
            this.showNotification("Product updated successfully!");
            this.fetchProducts();
            this.showEditProductForm = false;
          } else {
            this.showNotification("Failed to update product.", "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    //deleting products
    deleteProduct(productId) {
      fetch(`https://s25-midterm-project-yasli-k.onrender.com/${productId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            this.showNotification("Product deleted successfully!");
            this.fetchProducts();
            this.selectedProduct = null;
          } else {
            this.showNotification("Failed to delete product.", "error");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    sendEmail() {
      const email = "kanimbay20@gmail.com";
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(
        this.subject
      )}&body=${encodeURIComponent(
        `Last Name: ${this.lastName}\nEmail: ${this.email}\nMessage: ${this.message}`
      )}`;
      window.location.href = mailtoLink;
      this.showNotification("Email sent successfully!");
    },
    checkLoginStatus() {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (isLoggedIn) {
        this.isLoggedIn = true;
        this.loggedInUser = localStorage.getItem("loggedInUser");
        this.currentPage = "dashboard";
        this.fetchFarmerProducts();
      }
    },
    showNotification(message, type = "success") {
      this.notification.message = message;
      this.notification.type = type;

      // Clear the notification after 3 seconds
      setTimeout(() => {
        this.notification.message = "";
        this.notification.type = "";
      }, 3000);
    },
  },
  created() {
    this.fetchProducts();
    this.checkLoginStatus();
  },
}).mount("#app");
