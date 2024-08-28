import React, { useState } from 'react';
import { Container, Paper, Grid, Button, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { backend } from 'declarations/backend';

const CalculatorPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: 'auto',
  maxWidth: 300,
}));

const CalculatorButton = styled(Button)(({ theme }) => ({
  fontSize: '1.25rem',
  margin: theme.spacing(0.5),
}));

const CalculatorDisplay = styled(Typography)(({ theme }) => ({
  background: theme.palette.grey[200],
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  textAlign: 'right',
  minHeight: '2.5em',
}));

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    backend.clear();
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      setLoading(true);
      const result = await backend.calculate(firstOperand, inputValue, operator);
      setLoading(false);

      if (result && result.length > 0) {
        setDisplay(result[0].toString());
        setFirstOperand(result[0]);
      } else {
        setDisplay('Error');
        setFirstOperand(null);
      }
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  return (
    <Container>
      <CalculatorPaper elevation={3}>
        <CalculatorDisplay variant="h4">
          {display}
          {loading && <CircularProgress size={20} style={{ marginLeft: 10 }} />}
        </CalculatorDisplay>
        <Grid container spacing={1}>
          {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
            <Grid item xs={3} key={btn}>
              <CalculatorButton
                fullWidth
                variant="contained"
                color={['/', '*', '-', '+', '='].includes(btn) ? 'primary' : 'secondary'}
                onClick={() => {
                  if (btn === '=') {
                    performOperation('=');
                  } else if (['+', '-', '*', '/'].includes(btn)) {
                    performOperation(btn);
                  } else if (btn === '.') {
                    inputDecimal();
                  } else {
                    inputDigit(btn);
                  }
                }}
              >
                {btn}
              </CalculatorButton>
            </Grid>
          ))}
          <Grid item xs={12}>
            <CalculatorButton fullWidth variant="contained" color="error" onClick={clear}>
              Clear
            </CalculatorButton>
          </Grid>
        </Grid>
      </CalculatorPaper>
    </Container>
  );
};

export default App;
