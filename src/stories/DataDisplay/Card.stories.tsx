import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

function CardDemo() {
  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Composant Card</CardTitle>
        <CardDescription>Affichage synthétique d’information.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted-foreground">Exemple de composition avec action.</p>
        <Button size="sm">Voir détail</Button>
      </CardContent>
    </Card>
  );
}

const meta = {
  title: 'Data Display/Card',
  component: CardDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof CardDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
