{-# LANGUAGE DataKinds #-}
{-# LANGUAGE KindSignatures #-}
{-# LANGUAGE GADTs #-}
{-# LANGUAGE TypeOperators #-}
{-# LANGUAGE ScopedTypeVariables #-}

module AtariEDSL where

import GHC.TypeLits
import Data.Proxy

-- | Phantom type for tracking cycle counts
data Cycles (n :: Nat) = Cycles

-- | Action with cycle count tracked at type level
data Action (c :: Nat) a where
  Pure :: a -> Action 0 a
  ReadByte :: String -> Action 3 Word8  -- LDA takes ~3 cycles
  WriteByte :: String -> Word8 -> Action 3 ()  -- STA takes ~3 cycles
  SetBit :: String -> Int -> Action 5 ()  -- Read-modify-write ~5 cycles
  ClearBit :: String -> Int -> Action 5 ()
  Seq :: Action m a -> Action n b -> Action (m + n) b
  Loop :: KnownNat n => Proxy n -> Action m () -> Action (m * n) ()
  WaitScanline :: Action 76 ()  -- WSYNC + overhead = 76 cycles (228/3 TIA clocks)
  InlineAsm :: String -> Action c ()  -- Escape hatch with manual cycle annotation

-- | Functor instance
instance Functor (Action c) where
  fmap f (Pure a) = Pure (f a)
  fmap f (ReadByte addr) = Seq (ReadByte addr) (Pure . f)
  fmap _ other = error "fmap not fully implemented"

-- | Monad instance (simplified)
instance Applicative (Action 0) where
  pure = Pure
  (Pure f) <*> (Pure a) = Pure (f a)

instance Monad (Action 0) where
  return = Pure
  (Pure a) >>= f = f a

-- | Sequencing operator with cycle addition
(>>>) :: Action m a -> Action n b -> Action (m + n) b
(>>>) = Seq
infixl 1 >>>

-- | Budget checker - ensures actions fit within cycle budget
within :: forall budget actual a. (KnownNat budget, KnownNat actual) 
       => Proxy budget -> Action actual a -> Either String (Action actual a)
within budgetProxy action =
  let budget = natVal budgetProxy
      actual = natVal (Proxy :: Proxy actual)
  in if actual <= budget
     then Right action
     else Left $ "Cycle budget exceeded: " ++ show actual ++ " > " ++ show budget

-- | Code generation to C
class CodeGen a where
  genC :: a -> String

instance KnownNat n => CodeGen (Action n ()) where
  genC action = "/* " ++ show (natVal (Proxy :: Proxy n)) ++ " cycles */\n" ++ go action
    where
      go :: Action m () -> String
      go (Pure ()) = ""
      go (ReadByte addr) = "  temp = " ++ addr ++ ";\n"
      go (WriteByte addr val) = "  " ++ addr ++ " = " ++ show val ++ ";\n"
      go (SetBit addr bit) = "  " ++ addr ++ " |= (1 << " ++ show bit ++ ");\n"
      go (ClearBit addr bit) = "  " ++ addr ++ " &= ~(1 << " ++ show bit ++ ");\n"
      go (Seq a b) = go a ++ go b
      go (Loop (n :: Proxy n) body) = 
        "  for (i = 0; i < " ++ show (natVal n) ++ "; i++) {\n" 
        ++ indent (go body) ++ "  }\n"
      go WaitScanline = "  asm volatile(\"sta WSYNC\");\n"
      go (InlineAsm code) = "  asm volatile(\"" ++ code ++ "\");\n"

      indent :: String -> String
      indent = unlines . map ("  " ++) . lines

-- Type aliases for common operations
type Word8 = Int

-- | Example: Render a scanline from bitmap
renderScanline :: Int -> Action 76 ()
renderScanline line = 
  WaitScanline >>>
  WriteByte "PF0" 0 >>>  -- 3 cycles
  WriteByte "PF1" 0 >>>  -- 3 cycles
  WriteByte "PF2" 0      -- 3 cycles
  -- Total: 76 cycles (WSYNC) + 9 cycles = fits in scanline

-- | Update bitmap for a puck at (x, y)
updatePuckBitmap :: Int -> Int -> Action 15 ()
updatePuckBitmap x y =
  let byteIdx = x `div` 8
      bitIdx = x `mod` 8
  in SetBit ("bitmap[" ++ show y ++ "][" ++ show byteIdx ++ "]") bitIdx >>>
     Pure ()

-- | Complete frame render (192 scanlines)
renderFrame :: Action (192 * 76) ()
renderFrame = Loop (Proxy :: Proxy 192) renderScanline

-- Example usage showing cycle budget checking
exampleBudgetCheck :: Either String (Action 100 ())
exampleBudgetCheck = within (Proxy :: Proxy 100) $ 
  WaitScanline >>> WriteByte "PF0" 255 >>> WriteByte "PF1" 255
