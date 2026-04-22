library(shiny)
library(bslib)
library(shinydashboard)
# Define UI 
ui <- fluidPage(
  #theme = bs_theme(version = 4, bootswatch = "flatly"),
  # El titulo del app
  titlePanel(h1(strong("Clasificación IOTA de masas anexiales"), style = "color: navy")),
  HTML('<hr style="color: black;">'),
  #box(status = "warning", h1(status = "primary","Clasificación IOTA de masas anexiales", align = "center", style = "color:blue; font-family:times"), width = 12),
  #HTML('<hr style="color: blue;">'),
  
    #definimos los 10 botones que tendra la app,  los botones se llamaran de B1 a B5 de benigno, y M1 a M5 de maligno
  #definimos los botones benignos, primer apartado el nombre del boton, segundo el titulo que muestra por la app, tercero una lista de opciones con su valor equivalente, cuarto nos permite seleccionar la casilla como un valor numerico
  sidebarLayout(
  sidebarPanel(
    fluidRow(
    column(5,
  radioButtons("B1", h6("Es unilocular"),
               choices = list("Si" = 1, "No" = 0),selected = 0)),
  column(5,
         radioButtons("M1", h6("Es un tumor sólido e irregular"),
                      choices = list("Si" = 1, "No" = 0),selected = 0)),
    ),
    
  fluidRow(
    column(5,
           radioButtons("B2", h6("Hay presencia de componentes sólidos con un diámetro menor de 7mm"),
                        choices = list("Si" = 1, "No" = 0),selected = 0),
    ),
  column(5,
         radioButtons("M2", h6("Presencia de ascitis"),
                      choices = list("Si" = 1, "No" = 0),selected = 0)),
  ),
    
  
  
  fluidRow(
    column(5,
           radioButtons("B3", h6("Presencia de sombras acústicas"),
                        choices = list("Si" = 1, "No" = 0),selected = 0)),
    column(5,
           radioButtons("M3", h6("Presenta al menos 4 estructuras papilares"),
                        choices = list("Si" = 1, "No" = 0),selected = 0)),
  ),
    
   
  fluidRow(
    column(5,
           radioButtons("B4", h6("Tumor multilocular de paredes lisas con diámetro mayor < 100mm"),
                        choices = list("Si" = 1, "No" = 0),selected = 0)),
  column(5,
         radioButtons("M4", h6("Es un tumor sólido y multilocular cuyo diámetro es mayor o igual a 100mm"),
                      choices = list("Si" = 1, "No" = 0),selected = 0)),
  ),
    
  
  fluidRow(
    column(5,
           radioButtons("B5", h6("El tumor no tiene flujo sanguineo (Doppler negativo)"),
                        choices = list("Si" = 1, "No" = 0),selected = 0)),
    column(5,
  radioButtons("M5", h6("Presenta un alto flujo sanguineo (Doppler positivo)"),
               choices = list("Si" = 1, "No" = 0),selected = 0)),
  ),
  width = 6),
    # Main panel for displaying outputs ----
    mainPanel(
      # Output: resultado al aplicar las reglas
      h2(textOutput("distText"), style="color:red"),
      HTML('<hr style="color: blue;">'),
      p(em("Copyright 2021 UGC Obstetricia y Ginecología" )),
      p(em("Hospital Universitario Puerto Real" )),
      p(em("Servicio Andaluz de Salud" )),
      HTML('<hr style="color: blue;">'),
      p(em("Esta calculadora se ha diseñado para uso exclusivo por profesionales de la salud. Si este no es su caso, por favor, no la use. La información ofrecida debe ser siempre interpretada por un profesional y no debe reemplazar la consulta médica o cualquier diagnóstico o procedimiento terapéutico. Los autores no se hacen responsables del uso inapropiado de esta calculadora."), align = "left", style = "font-family: 'times'; font-si16pt"),
      HTML('<hr style="color: blue;">'),
      p(em(a("Adaptado de: Timmerman D, Van Calster B, et al. Am J Obstet Gynecol 2016;214:424-437.", href = "https://www.iotagroup.org/sites/default/files/Timmerman_AJOG_2016_SRrisk.pdf" ) )),
      HTML('<hr style="color: blue;">'),
      
      
      
      
      
      width = 6,  
      )
  )
)
# Define server
server <- function(input, output) {
  OUT <- ""
  output$distText <- renderText({
   if (input$M1=="0" && input$M2=="0" && input$M3=="0" && input$M4=="0" && input$M5=="0"){
     if(input$B1=="1" || input$B2=="1" ||input$B3=="1" ||input$B4=="1" ||input$B5=="1"){
       OUT <- "Sospechoso de benignidad"
     }
   }
   else if (input$B1=="0" && input$B2=="0" && input$B3=="0" && input$B4=="0" && input$B5=="0"){
     if(input$M1=="1" || input$M2=="1" ||input$M3=="1" ||input$M4=="1" ||input$M5=="1"){
       OUT <- "Sospechoso de malignidad"
     }
   }
   else {
     OUT <- "Indeterminado"
   }
  
  
    })

}
shinyApp(ui = ui, server = server)