# Definicion interface de usuario
ui <- fluidPage(
  
  # Titulo de la aplicacion
  titlePanel(h1(strong("Thyroid nodule malignancy risk calculator"))),
  HTML('<hr style="color: black;">'),
  
  
  # Controles de entrada de la calculadora
  sidebarLayout(
    sidebarPanel(
      
      p("A. Patient charasteristics:"),
      sliderInput("Edad",
                  "1.- Age (years):",
                  min = 16,
                  max = 89,
                  value = 30,
                  step = 1),
      selectInput("Sexo",
                  "2.- Sex:",
                  choices = list("Female", "Male"),
                  selected = "Male"),
      
      selectInput("AntCDT",
                  "3.- Family history (first degree) of thyroid cancer:",
                  choices = list("Yes", "No"),
                  selected = "No"),
      sliderInput("TSH",
                  "4.- Thyroid stimulating hormone (TSH) levels (mUI/L):",
                  min = 0,
                  max = 30,
                  value = 2,
                  step = 0.1),
      selectInput("Tiroiditis",
                  "5.- Autoinmune thyroiditis (clearly positive Tg-Ab or TPO-Ab:",
                  choices = list("Yes", "No"),
                  selected = "No"),
      p("B.- Thyroid nodule ultrasonographic characteristiscs:"),
      sliderInput("Diametro",
                  "1.- Maximum thyroid nodule diameter (mm):",
                  min = 1,
                  max = 80,
                  value = 10,
                  step = 0.5),
      selectInput("Consistencia",
                  "2.- Content:",
                  choices = list("Cystic", "Mixted/Spongiform", "Solid"),
                  selected = "Mixted/Spongiform"), 
      selectInput("Ecogenicidad",
                  "3.- Echogenicity:",
                  choices = list("Anechoic", "Isoechoic or Hyperechoic", "Hypoechoic"),
                  selected = "Isoechoic or Hyperechoic"),
      selectInput("Margenes",
                  "4.- Margins:",
                  choices = list("Well-defined", "Irregular (microlobulated or spiculated"),
                  selected = "Well-defined"),
      selectInput("Calcificaciones",
                  "5.- Calcifications:",
                  choices = list("No", "Macrocalcifications", "Microcalcifications"),
                  selected = "No"),
      selectInput("Forma",
                  "6.- Shape:",
                  choices = list("Oval", "Taller than wide"),
                  selected = "Oval"),
      selectInput("Ganglio",
                  "7.- Suspicious lymph node:",
                  choices = list("Yes", "No"),
                  selected = "No"),
      br(),
      br()
      
    ),
    
    # Mostrar riesgo de cÃ¡ncer de tiroides y su intervalo de confianza
    mainPanel(
      h2(textOutput("riesgo"), style="color:red"),
      h3(em(textOutput("conf_int"), style="color:blue")),
      HTML('<hr style="color: blue;">'),
      h4(textOutput("ATA"), style="color:red"),
      
      h4(textOutput("ATA2"), style="color:red"),
      
      h4(textOutput("ATA3"), style="color:red"),
      h3(em("Terms of use:")),            
      p(em("This calculator is designed for USE EXCLUSIVELY BY HEALTH PROFESSIONAL. If it is not your case, please do not use them. The information provided must always be interpreted by a healthcare professional and does not replace the medical visit or any diagnostic or therapeutic procedure. The authors are not responsible for inappropriate use of this calculator."), align = "left", style = "font-family: 'times'; font-si16pt"),
      HTML('<hr style="color: blue;">'),
      h3(em("Statistical information:")),
      p(em("With a cut-off point in the 50% probability of thyroid cancer, this calculator has an area under the R.O.C. curve of 0.93 (95% confidence interval 0.91 - 0.95)."), align = "left", style = "font-family: 'times'; font-si16pt"),
      p(em("In addition, through a 10-fold cross-validation process, the regression model used to design this calculator has an accuracy of 0.87 and a Kappa index of 0.60."), align = "left", style = "font-family: 'times'; font-si16pt"),
      HTML('<hr style="color: blue;">'),
      p(em("Copyright 2019. Juan Jesus Fernandez Alba (1) & Florentino Carral San Laureano (2)" )),
      p(em("(1) Department of Obstetrics and Gynecology" )),
      p(em("    University Hospital of Puerto Real" )),
      p(em("    INIBICA (Biomedical Research Institute of Cádiz )" )),
      p(em("(2) Department of Endocrinology" )),
      p(em("    University Hospital of Puerto Real" )),
      p(em("Puerto Real. Cádiz. SPAIN" )),
      HTML('<hr style="color: blue;">'),
      h3(em("Reference:")),
      p(em("Carral F, Fernandez Alba JJ, Jimenez JM, Jimenez AI, Tome M, Ayala MC. Development and internal validation of a predictive model for individual cancer risk assesment for thyroid nodules. Endocr Pract. 2020;26(No. 10): 1077-1084"), align = "left", style = "font-family: 'times'; font-si16pt"),
      
      
    )
    
    
    
  )
)