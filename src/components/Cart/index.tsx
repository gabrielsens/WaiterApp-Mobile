import { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { CartItem } from '../../Types/CartItem';
import { Product } from '../../Types/Product';
import { formatCurrency } from '../../Utils/formatCurrency';
import Button from '../Button';
import { MinusCircle } from '../Icons/MinusCircle';
import { PlusCircle } from '../Icons/PlusCircle';
import OrderConfirmModal from '../OrderConfirmModal';
import { Text } from '../Text';
import { Item, ProductContainer, Actions, Image, QuantityContainer, ProductDetails, Summary, TotalContainer } from './styles';

interface CartProps {
  cartItems: CartItem[]
  onAddToCart: (product: Product) => void;
  onDecrementCart: (product: Product) => void;
  onConfirmOrder: () => void;
}

export default function Cart({ cartItems, onAddToCart, onDecrementCart, onConfirmOrder }: CartProps) {
  const [isLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const total = cartItems
    .reduce((acc, cartItem) => acc + (cartItem.quantity * cartItem.product.price), 0);

  function handleConfirmOrder() {
    setIsModalVisible(true);
  }

  function handleOk() {
    onConfirmOrder();
    setIsModalVisible(false);
  }

  return (
    <>
      <OrderConfirmModal
        visible={isModalVisible}
        onOk={handleOk}
      />
      {cartItems.length > 0 && (
        <FlatList
          data={cartItems}
          keyExtractor={cartItem => cartItem.product._id}
          showsVerticalScrollIndicator={false}
          style={{ marginBottom: 20, maxHeight: 140 }}
          renderItem={({ item: cartItem}) => (
            <Item>
              <ProductContainer>
                <Image source={{
                  uri: `http://192.168.0.12:3001/uploads/${cartItem.product.imagePath}`
                }} />
                <QuantityContainer>
                  <Text size={14} color="#666">{cartItem.quantity}x</Text>
                </QuantityContainer>
                <ProductDetails>
                  <Text size={14} weight="600">{cartItem.product.name}</Text>
                  <Text size={14} color="#666" style={{ marginTop: 4 }} >{formatCurrency(cartItem.product.price)}</Text>
                </ProductDetails>
              </ProductContainer>
              <Actions>
                <TouchableOpacity style={{ marginRight: 24}} onPress={() => onAddToCart(cartItem.product)}><PlusCircle /></TouchableOpacity>
                <TouchableOpacity onPress={() => onDecrementCart(cartItem.product)}><MinusCircle /></TouchableOpacity>
              </Actions>
            </Item>
          )}
        />
      )}
      <Summary>
        <TotalContainer>
          {cartItems.length > 0 ? (
            <>
              <Text color='#666'>Total</Text>
              <Text size={20} weight="600">{formatCurrency(total)}</Text>
            </>
          ) : (
            <Text color='#666'>Seu carrinho está vazio</Text>
          )}
        </TotalContainer>
        <Button
          disabled={cartItems.length === 0}
          isLoading={isLoading}
          onPress={() => handleConfirmOrder()}>
              Confirmar pedido
        </Button>
      </Summary>
    </>
  );
}
