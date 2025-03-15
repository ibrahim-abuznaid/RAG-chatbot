import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { styled } from '@mui/material/styles';

export const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  width: '100%',
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  },
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
}));

interface RegionSelectProps {
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  error?: boolean;
  helperText?: string;
}

export const RegionSelect = ({ value, onChange, error, helperText }: RegionSelectProps) => (
  <FormControl fullWidth error={error}>
    <InputLabel id="region-select-label">Region</InputLabel>
    <Select
      labelId="region-select-label"
      id="region-select"
      value={value}
      label="Region"
      name="region"
      onChange={onChange}
      error={error}
    >
      <MenuItem value="middle-east">Middle East</MenuItem>
      <MenuItem value="europe">Europe</MenuItem>
      <MenuItem value="north-america">North America</MenuItem>
      <MenuItem value="asia">Asia</MenuItem>
    </Select>
    {helperText && <Box sx={{ color: 'error.main', mt: 1, fontSize: '0.75rem' }}>{helperText}</Box>}
  </FormControl>
); 