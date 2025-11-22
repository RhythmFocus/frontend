// 뽑기 관련 타입 정의

export type FoodItem = 'Burger' | 'Hotdog' | 'Chicken' | 'Pizza' | 'Donut';

export interface GachaRequest {
  count: number; // 1 or 5
}

export interface GachaResponse {
  usedTickets: number;
  remainingTickets: number;
  items: string[];
}

export interface FoodItemDisplay {
  name: FoodItem;
  imagePath: string;
  displayName: string;
}

// 음식 아이템과 이미지 매핑
export const FOOD_ITEM_MAP: Record<string, FoodItemDisplay> = {
  'Burger': {
    name: 'Burger',
    imagePath: '/food/food-burger.png',
    displayName: '버거'
  },
  'Hotdog': {
    name: 'Hotdog',
    imagePath: '/food/food-hotdog.png',
    displayName: '핫도그'
  },
  'Chicken': {
    name: 'Chicken',
    imagePath: '/food/food-chicken.png',
    displayName: '치킨'
  },
  'Pizza': {
    name: 'Pizza',
    imagePath: '/food/food-pizza.png',
    displayName: '피자'
  },
  'Donut': {
    name: 'Donut',
    imagePath: '/food/food-donut.png',
    displayName: '도넛'
  }
};