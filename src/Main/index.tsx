import { useEffect, useState } from 'react';
import axios from 'axios';
import { ActivityIndicator } from 'react-native';
import Button from '../components/Button';
import Cart from '../components/Cart';
import Categories from '../components/Categories';
import Header from '../components/Header';
import Menu from '../components/Menu';
import TableModal from '../components/TableModal';
import { CartItem } from '../Types/CartItem';
import { Product } from '../Types/Product';
import { CategoriesContainer, CenteredConteiner, Container, FooterContainer, FooterSafeAreaView, MenuContainer } from './styles';

import { Empty } from '../components/Icons/Empty';
import { Text } from '../components/Text';
import { Category } from '../Types/Category';
import { api } from '../Utils/api';

export default function Main() {
  const [isTableModalVisible, setIsTableModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get('http://192.168.0.7:3001/categories'),
      api.get('http://192.168.0.7:3001/products')
    ]).then(([categoriesReponse, productsReposnse]) => {
      setCategories(categoriesReponse.data);
      setProducts(productsReposnse.data);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  async function handleSelectCategory(categoryId: string) {
    try {
      setIsLoadingProducts(true);
      const route = !categoryId ? '/products' : `/categories/${categoryId}/products`;
      const { data } = await api.get(route);
      setProducts(data);
    } finally {
      setIsLoadingProducts(false);
    }
  }

  function handleSaveTable(table: string) {
    setSelectedTable(table);
  }

  function handleResetOrder() {
    setCartItems([]);
    setSelectedTable('');
  }

  function handleAddToCart(product: Product) {
    if(!selectedTable) {
      setIsTableModalVisible(true);
    }
    setCartItems((prevState) => {
      const itemIndex = prevState.findIndex(cartItem => cartItem.product._id === product._id);

      if(itemIndex < 0) {
        return prevState.concat({
          quantity: 1,
          product
        });
      }

      const newCartItems = [...prevState];

      const item = newCartItems[itemIndex];

      newCartItems[itemIndex]= {
        ...item,
        quantity: item.quantity + 1,
      };

      return newCartItems;
    });
  }

  function handlerDecrementCartItem(product: Product) {
    setCartItems((prevState) => {
      const itemIndex = prevState.findIndex(cartItem => cartItem.product._id === product._id);

      const item = prevState[itemIndex];

      const newCartItems = [...prevState];

      if (item.quantity === 1) {
        newCartItems.splice(itemIndex, 1);

        return newCartItems;
      }

      newCartItems[itemIndex]= {
        ...item,
        quantity: item.quantity - 1,
      };

      return newCartItems;
    });
  }

  return (
    <>
      <Container>
        <Header selectedTable={selectedTable} onCancelOrder={handleResetOrder} />

        {isLoading ? (
          <CenteredConteiner>
            <ActivityIndicator color="#D73035" size="large" />
          </CenteredConteiner>
        ) : (
          <>
            <CategoriesContainer>
              <Categories categories={categories} onSelectCategory={handleSelectCategory} />
            </CategoriesContainer>

            {isLoadingProducts ? (
              <CenteredConteiner>
                <ActivityIndicator color="#D73035" size="large" />
              </CenteredConteiner>
            ) : (
              <>
                {products.length > 0 ? (
                  <MenuContainer>
                    <Menu
                      onAddToCart={handleAddToCart}
                      products={products}
                    />
                  </MenuContainer>
                ) : (
                  <CenteredConteiner>
                    <Empty />
                    <Text color='#666' style={{ marginTop: 24 }}>Nenhum produto foi encontrado</Text>
                  </CenteredConteiner>
                )}
              </>
            )}


          </>
        )}

      </Container>
      <FooterContainer>
        {/* <FooterSafeAreaView> */}
        {!selectedTable &&
        <Button
          onPress={() => setIsTableModalVisible(true)}
          disabled={isLoading}
        >
            Novo pedido
        </Button>}
        {selectedTable && (
          <Cart
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onDecrementCart={handlerDecrementCartItem}
            onConfirmOrder={handleResetOrder}
            selectedTable={selectedTable}
          />
        )}
        {/* </FooterSafeAreaView> */}
      </FooterContainer>

      <TableModal visible={isTableModalVisible} onClose={() => setIsTableModalVisible(false)} onSave={handleSaveTable} />
    </>
  );
}
