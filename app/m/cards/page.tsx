import FlashcardDeck from '@/components/mobile/FlashcardDeck';
import { QUICK_CARDS } from '@/lib/quick-review-cards';

export const metadata = {
  title: 'Flashcards',
};

export default function MobileCardsPage() {
  return <FlashcardDeck cards={QUICK_CARDS.slice(0, 10)} />;
}
