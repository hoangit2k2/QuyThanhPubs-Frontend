import { Component, OnInit } from '@angular/core';
import { MenuItem, MessageService, PrimeNGConfig, SelectItem } from 'primeng/api';
import { Category } from 'src/app/models/category.model';
import { DeliveryProductSatus } from 'src/app/models/delivery-product-status.enum';
import { ItemProduct } from 'src/app/models/item.model';
import { OrderedTable } from 'src/app/models/ordered-table.model';
import { Product } from 'src/app/models/product.model';
import { AlertService } from 'src/app/services/alert.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { StoreService } from 'src/app/services/store.service';
import { TableService } from 'src/app/services/table.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-create-table',
  templateUrl: './create-table.component.html',
  styleUrls: ['./create-table.component.css']
})
export class CreateTableComponent implements OnInit {
  isLoading!: boolean;
  isNull!: boolean;
  layout = 'grid'
  items!: MenuItem[];
  tempTotal: number = 0;
  categories: Category[] = []
  sortOptions !: SelectItem[];
  sortField!: string;
  sortOrder!: number;
  sortKey!: string
  value4: number = 50;
  products : Product[] = [];
  isSaving: boolean = false;
  orderedProducts: ItemProduct[] =[];
  orderedTable: OrderedTable = {
    name: '',
    phone:'',
    user: '',
    orderedProducts:[],
    note: ''
  };
  menuCheckout!: MenuItem[];
  constructor(private primengConfig: PrimeNGConfig, 
    private productService: ProductService, 
    private categoryService: CategoryService,
    private storeService: StoreService,
    private tableService: TableService,
    private alertService: AlertService,
    private location: Location) {
   }
  ngOnInit(): void {
    this.menuCheckout = [{
      label: 'Update',
      icon: 'pi pi-refresh',
      command: () => {
          console.log()
      }
  },
  {
      label: 'Delete',
      icon: 'pi pi-times',
      command: () => {
        console.log()
      }
  }]
    var data= this.storeService.getCart("orderedTable");
    console.log(data);
   if (data){
      this.orderedTable = data;
       this.orderedProducts = this.orderedTable.orderedProducts;
       
       this.getTempTotal();
   }
   this.categoryService.getAllCategories().subscribe(data => {
    this.categories=data;
    var subitems = [{
      label : "Tất cả",
      command : () =>{
        this.showProducts()
      },
      styleClass: 'icon-all'
   

    }]
    this.categories.map(c => {
        subitems = [...subitems, {
          label: c.name,
          command : () =>{
            this.showProducts(c.id)
          },
          styleClass: `icon${c.id}`
    
        }]
    })
    this.items = [{ label: 'DANH MỤC SẢN PHẨM',items: subitems}]
    this.showProducts()
   })
  this.primengConfig.ripple = true;

  
  }
  addProductCart(product: Product){
    var check =  this.orderedProducts.some(p => p.product.id === product.id);
    if (!check){
      this.orderedProducts = [...this.orderedProducts, {product, quantity: 1, status: DeliveryProductSatus.NOT_YET_DELIVERED}]
    }
    else{
      this.orderedProducts = this.orderedProducts.map(p => {
        if (product.id === p.product.id){
            var quantity = p.quantity;
            return {...p, quantity: quantity+1}
        }
        else{
          return p;
        }
      })
    }
    this.saveOrderTableToStore();
    this.getTempTotal();
    
  }
  showProducts(id?: number){
    this.isLoading =true
    this.isNull = true;
    if (id === undefined) {
      this.productService.getAllProducts().subscribe(data => {
        this.products = data
        this.isLoading= false
        if(this.products.length ===0){
          this.isNull = true;
        }
        else{
          this.isNull = false;
        }
      });
    }
    else{
      this.productService.getProductsByCategory(id).subscribe(data => {
        this.products = data
        this.isLoading= false
        if(this.products.length ===0){
          this.isNull = true;
        }
        else{
          this.isNull = false;
        }
      });
    }
    
    
    
  }

  deleteOrderedProduct(product: Product){
    let index = this.orderedProducts.findIndex((p) => p.product.id === product.id);
   if (index !== -1) {
      this.orderedProducts.splice(index, 1);
      
   }
   this.getTempTotal();
   this.saveOrderTableToStore();
  }
  getTempTotal(){
    if (this.orderedProducts?.length ===0) this.tempTotal = 0;
    else {
      this.tempTotal = this.orderedProducts.reduce((total, p) => total += p.product.price * p.quantity,0);
    }
  }
  cancelTable(){
    this.storeService.removeCart("orderedTable")
      this.orderedTable = {
        name: '',
        phone:'',
        orderedProducts:[],
        note: ''
      };
      this.orderedProducts = this.orderedTable.orderedProducts;
      this.isSaving = false;
      this.getTempTotal();
  }
  changePrice($event:any){
    this.saveOrderTableToStore();
    this.getTempTotal();
  }
  saveOrderTableToStore(){
    this.orderedTable.orderedProducts = this.orderedProducts;
    this.storeService.saveCart("orderedTable",this.orderedTable );

  }
  saveTable(){
    console.log(this.orderedTable)
    this.isSaving = true
    this.tableService.createTable(this.orderedTable).subscribe(data => {
      this.storeService.removeCart("orderedTable")
      this.orderedTable = {
        name: '',
        phone:'',
        orderedProducts:[],
        note: ''
      };
      this.orderedProducts = this.orderedTable.orderedProducts;
      this.alertService.showAlert('success', 'Thông báo', 'Tạo bàn cho khách hàng thành công!')
      this.isSaving = false;
      this.getTempTotal();
    }, 
    error =>{
      this.alertService.showAlert('error', 'Thông báo', error)
      this.isSaving = false;
    })
  }
  back(){
    this.location.back();
  }
}
