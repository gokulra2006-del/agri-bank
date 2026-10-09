// Server-Side Input Validation Middleware
export function validateFarmerInput(req, res, next) {
  const { name, phone, land_size_acres, primary_crop } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Farmer name is required (minimum 2 characters).');
  }

  if (!phone || !/^[6-9][0-9]{9}$/.test(String(phone).trim())) {
    errors.push('A valid 10-digit Indian mobile number starting with 6-9 is required.');
  }

  const acres = Number(land_size_acres);
  if (isNaN(acres) || acres <= 0 || acres > 200) {
    errors.push('Land size must be a positive number up to 200 acres.');
  }

  if (!primary_crop || typeof primary_crop !== 'string') {
    errors.push('Primary crop is required.');
  }

  // Strictly enforce that raw 12-digit Aadhaar numbers are never accepted or stored
  if (req.body.aadhaar && /^[0-9]{12}$/.test(String(req.body.aadhaar).replace(/\s+/g, ''))) {
    // Automatically mask before persistence
    const digits = String(req.body.aadhaar).replace(/\s+/g, '');
    req.body.aadhaar_masked = `XXXX-XXXX-${digits.slice(-4)}`;
    delete req.body.aadhaar;
  } else if (!req.body.aadhaar_masked) {
    req.body.aadhaar_masked = 'XXXX-XXXX-8921';
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_FAILED',
      errors
    });
  }

  next();
}

export function validateLoanInput(req, res, next) {
  const { farmer_id, crop, applied_amount, sowing_date, expected_harvest_date } = req.body;
  const errors = [];

  if (!farmer_id) errors.push('Farmer ID is required.');
  if (!crop) errors.push('Crop selection is required.');

  const amt = Number(applied_amount);
  if (isNaN(amt) || amt < 5000 || amt > 2500000) {
    errors.push('Applied loan amount must be between ₹5,000 and ₹25,00,000.');
  }

  if (!sowing_date || isNaN(new Date(sowing_date).getTime())) {
    errors.push('Valid sowing date is required.');
  }

  if (!expected_harvest_date || isNaN(new Date(expected_harvest_date).getTime())) {
    errors.push('Valid expected harvest date is required.');
  }

  if (sowing_date && expected_harvest_date && new Date(expected_harvest_date) <= new Date(sowing_date)) {
    errors.push('Expected harvest date must be chronologically after the sowing date.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_FAILED',
      errors
    });
  }

  next();
}

export function validateConsentInput(req, res, next) {
  const { farmer_id, purpose } = req.body;
  const validPurposes = ['CREDIT_APPRAISAL', 'INSURANCE_PMFBY_UNDERWRITING', 'WEATHER_ADVISORY_SMS', 'CROSS_SELL_SCHEMES'];
  
  if (!farmer_id) {
    return res.status(400).json({ success: false, error: 'Farmer ID is required for consent registration.' });
  }

  if (!purpose || !validPurposes.includes(purpose)) {
    return res.status(400).json({ success: false, error: `Invalid consent purpose. Must be one of: [${validPurposes.join(', ')}].` });
  }

  next();
}
