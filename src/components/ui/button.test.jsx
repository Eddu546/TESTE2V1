import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

describe('Componente Button', () => {
  it('deve renderizar o texto corretamente', () => {
    render(<Button>Clique aqui</Button>);
    const botao = screen.getByRole('button', { name: /clique aqui/i });
    expect(botao).toBeInTheDocument();
  });

  it('deve chamar a função onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Ação</Button>);
    
    const botao = screen.getByRole('button', { name: /ação/i });
    fireEvent.click(botao);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve estar desabilitado quando a prop disabled é passada', () => {
    render(<Button disabled>Bloqueado</Button>);
    const botao = screen.getByRole('button', { name: /bloqueado/i });
    expect(botao).toBeDisabled();
  });
});