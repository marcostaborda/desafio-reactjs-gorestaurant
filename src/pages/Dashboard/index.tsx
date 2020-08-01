import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  price_formatted?: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get<IFoodPlate[]>('/foods');
      const foodsFormatted = response.data.map(food => {
        return {
          ...food,
          price_formatted: Number(food.price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
        };
      });
      setFoods(foodsFormatted);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const addFood = { ...food, available: true };
      const foodResponse = await api.post('/foods', addFood);
      setFoods([
        ...foods,
        {
          ...foodResponse.data,
          price_formatted: Number(food.price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const foodEdited = { ...food, available: editingFood.available };

    await api.put(`/foods/${editingFood.id}`, foodEdited);

    const updatedFoods = foods.map(foodItem => {
      const isFoodUpdate = foodItem.id === editingFood.id;

      if (isFoodUpdate) {
        const formattedFood = {
          ...food,
          price_formatted: Number(food.price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }),
        };

        return { ...editingFood, ...formattedFood };
      }

      return foodItem;
    });

    setFoods(updatedFoods);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    const deletedFoods = foods.filter(food => food.id !== id);

    setFoods(deletedFoods);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    const foodEditing = { ...food, price: food.price };

    setEditingFood(foodEditing);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
