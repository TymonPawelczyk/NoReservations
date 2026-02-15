import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmExitModal from '../ConfirmExitModal';

describe('ConfirmExitModal Component', () => {
  describe('Rendering', () => {
    it('should render modal with Polish text', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText('Ratunku!')).toBeInTheDocument();
      expect(screen.getByText('Chcesz nas zostawić?')).toBeInTheDocument();
    });

    it('should display emojis in text content', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      // Should contain various emojis
      expect(screen.getByText(/💚/)).toBeInTheDocument();
      expect(screen.getByText(/💔/)).toBeInTheDocument();
    });

    it('should show both action buttons', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/Zostaję!/i)).toBeInTheDocument();
      expect(screen.getByText(/Wychodzę/i)).toBeInTheDocument();
    });

    it('should display warning message about partner', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/partner zostanie sam jak palec/i)).toBeInTheDocument();
    });

    it('should display humorous quote', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/Nie odchodź do tego światła/i)).toBeInTheDocument();
    });

    it('should show warning about no return', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/Uwaga: Nie ma odwrotu/i)).toBeInTheDocument();
    });

    it('should display encouraging message at bottom', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/Serio, zostań... będzie fajnie/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onCancel when stay button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const stayButton = screen.getByText(/Zostaję!/i);
      await user.click(stayButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm when exit button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const exitButton = screen.getByText(/Wychodzę/i);
      await user.click(exitButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks on stay button', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const stayButton = screen.getByText(/Zostaję!/i);
      await user.click(stayButton);
      await user.click(stayButton);
      await user.click(stayButton);

      expect(onCancel).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple clicks on exit button', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const exitButton = screen.getByText(/Wychodzę/i);
      await user.click(exitButton);
      await user.click(exitButton);

      expect(onConfirm).toHaveBeenCalledTimes(2);
    });
  });

  describe('Button Styling', () => {
    it('should have retro-button class on both buttons', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const stayButton = screen.getByText(/Zostaję!/i);
      const exitButton = screen.getByText(/Wychodzę/i);

      expect(stayButton).toHaveClass('retro-button');
      expect(exitButton).toHaveClass('retro-button');
    });

    it('should have green styling on stay button', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const stayButton = screen.getByText(/Zostaję!/i);
      expect(stayButton).toHaveClass('bg-green-600');
    });

    it('should have red styling on exit button', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const exitButton = screen.getByText(/Wychodzę/i);
      expect(exitButton).toHaveClass('bg-red-600');
    });
  });

  describe('Modal Layout', () => {
    it('should have dark overlay background', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(
        <ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />
      );

      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
      expect(overlay).toHaveClass('bg-black/80');
    });

    it('should be centered on screen', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(
        <ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />
      );

      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('flex');
      expect(overlay).toHaveClass('items-center');
      expect(overlay).toHaveClass('justify-center');
    });

    it('should have high z-index for overlay', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(
        <ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />
      );

      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toHaveClass('z-50');
    });

    it('should have gradient background on modal content', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(
        <ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />
      );

      const modalContent = container.querySelector('.bg-gradient-to-b');
      expect(modalContent).toBeInTheDocument();
      expect(modalContent).toHaveClass('from-purple-900');
      expect(modalContent).toHaveClass('to-pink-900');
    });

    it('should have border styling', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(
        <ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />
      );

      const modalContent = container.querySelector('.border-4');
      expect(modalContent).toHaveClass('border-yellow-400');
    });
  });

  describe('Emojis', () => {
    it('should display heart emojis on buttons', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/💚/)).toBeInTheDocument(); // Green heart on stay
      expect(screen.getByText(/💔/)).toBeInTheDocument(); // Broken heart on exit
    });

    it('should display sad emoji in warning text', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/😢/)).toBeInTheDocument();
    });

    it('should display warning triangle emoji', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/⚠️/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have clickable buttons', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const stayButton = screen.getByText(/Zostaję!/i);
      const exitButton = screen.getByText(/Wychodzę/i);

      expect(stayButton.tagName).toBe('BUTTON');
      expect(exitButton.tagName).toBe('BUTTON');
    });

    it('should render all text content in Polish', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      // Check for Polish-specific characters
      expect(screen.getByText(/Ratunku/)).toBeInTheDocument();
      expect(screen.getByText(/Zostaję/)).toBeInTheDocument();
      expect(screen.getByText(/Wychodzę/)).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should work with different callback functions', async () => {
      const user = userEvent.setup();
      let confirmCalled = false;
      let cancelCalled = false;

      const customConfirm = () => {
        confirmCalled = true;
      };
      const customCancel = () => {
        cancelCalled = true;
      };

      render(<ConfirmExitModal onConfirm={customConfirm} onCancel={customCancel} />);

      const exitButton = screen.getByText(/Wychodzę/i);
      await user.click(exitButton);
      expect(confirmCalled).toBe(true);

      const stayButton = screen.getByText(/Zostaję!/i);
      await user.click(stayButton);
      expect(cancelCalled).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizes', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      const title = screen.getByText('Ratunku!');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('sm:text-2xl');
    });

    it('should have responsive text and styling', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<ConfirmExitModal onConfirm={onConfirm} onCancel={onCancel} />);

      // Check for responsive h2
      const title = screen.getByText('Ratunku!');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('sm:text-2xl');
    });
  });
});
