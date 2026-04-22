# Calculadora de riesgo de cáncer de tiroides
# como una variable cuantitativa

library(shiny)
library(lattice)
library(ggplot2)
library(carData)
library(caret)
library(car)
library(survival)

multivariante_final <- readRDS("multivariante_final.rds")
load("ca_tiroides2.Rdata")