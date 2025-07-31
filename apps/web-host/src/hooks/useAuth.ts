import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@farms/firebase";

export function useAuth() {
  return { user: null, loading: false };
}
