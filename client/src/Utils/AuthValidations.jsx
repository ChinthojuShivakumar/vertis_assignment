export const validateRegister = (name, value) => {
  switch (name) {
    case "first_name":
      if (!value) return "First name is required";
      if (value.length < 2) return "Minimum 2 characters";
      return "";

    case "last_name":
      if (!value) return "Last name is required";
      return "";

    case "email":
      if (!value) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
      return "";

    case "password":
      if (!value) return "Password is required";
      if (value.length < 6) return "Minimum 6 characters";
      return "";

    default:
      return "";
  }
};

export const validateLogin = (name, value) => {
  switch (name) {
    case "email":
      if (!value) return "Email is required";
      if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email";
      return "";

    case "password":
      if (!value) return "Password is required";
      return "";

    default:
      return "";
  }
};
