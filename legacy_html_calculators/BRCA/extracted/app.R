#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)

# Define UI for application that draws a histogram
ui <- fluidPage(
    
    # Titulo
    h2(status = "primary","Ayuda a la indicación de prueba genética(mutación BRCA) en mujeres con susceptibilidad genética de cáncer de mama y ovario", align = "center", style = "font-family:times;color:navy"),
    hr(style = "border-top: 1px solid #A9A9A9;"),
    h6("Hospital Universitario Puerto Real (Servicio Andaluz de Salud)"),
    h6("Universidad de Cádiz"),
    h6("Copyright 2021. Juan Jesús Fernández Alba"),
    # Sidebar with a slider input for number of bins 
    sidebarLayout(
        sidebarPanel(
            radioButtons("mama_pre45",
                         h6(strong("¿El/La paciente ha tenido cáncer de mama antes de los 45 años?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("mama_pre50_doble",
                         h6(strong("¿El/La paciente ha tenido cáncer de mama antes de los 50 años y ha tenido un segundo cáncer de mama primario?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("mama_pre50_fam",
                         h6(strong("¿El/La paciente ha tenido cáncer de mama antes de los 50 años y tiene familiares con antedecentes familiares de cáncer de mama o estos son desconocidos?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("mama_pre60_Trineg",
                         h6(strong("¿El/La paciente ha tenido cáncer de mama antes de los 60 años con triple negativo?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("pre_tipos",
                         h6(strong("¿El/La paciente ha tenido dos o más cánceres de otro tipo?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("ovario",
                         h6(strong("¿La paciente ha tenido cáncer de ovario?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("baron",
                         h6(strong("¿El/La paciente de cáncer de mama es Varon?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("fam_pre50",
                         h6(strong("¿El/La paciente ha tenido un familiar con cáncer de mama diagnosticado antes de los 50 años de edad?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("fam_dosmamas",
                         h6(strong("¿El/La paciente ha tenido al menos dos familiares con cáncer de mama?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("fam_ovario",
                         h6(strong("¿El/La paciente ha tenido familiares con cáncer de ovario?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("mama_fam_baron",
                         h6(strong("¿El/La paciente ha tenido familiares Varones con cáncer de mama?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("fam_prostata",
                         h6(strong("¿El/La paciente ha tenido al menos dos familiares con cáncer de prostata y/o cáncer de pancreas?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("askenazi",
                         h6(strong("¿El/La paciente tiene ascendencia judía askenazi?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("tricky",
                         h6(strong("¿El/La paciente presenta cáncer de prostata o de páncreas y tiene al menos dos familiares con antecedentes de cánceres relacionados con BRCA?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("fam_cercano_temprana",
                         h6(strong("¿El/La paciente ha tenido familiares consanguineos(padres,hermanos,hijos) con cáncer de mama ha edades tempranas?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("fam_bcra",
                         h6(strong("¿El/La paciente ha tenido un familiar con una mutación conocida en BRCA1 o BRCA2?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            radioButtons("fam_general",
                         h6(strong("¿El/La paciente ha tenido algun familiar con con cáncer que cumpla alguno de estos criterios para la prueba diagnostica?")),
                         choices = list("Sí" = "1", "No" = "0"), selected =0),
            
            # Show a plot of the generated distribution
        ),
        mainPanel(
            h2(textOutput("salida"), style = "color:navy;font-family:times"),
            hr(style = "border-top: 1px solid #4682b4;"),
        )
    )
)

# Define server logic required to draw a histogram
server <- function(input, output) {
    
    output$salida <- renderText({
        lista_inputs <- c(as.numeric(input$mama_pre45),as.numeric(input$mama_pre50_doble),as.numeric(input$mama_pre50_fam),as.numeric(input$mama_pre60_Trineg),as.numeric(input$pre_tipos),as.numeric(input$ovario),as.numeric(input$baron),as.numeric(input$fam_pre50),as.numeric(input$fam_dosmamas),as.numeric(input$fam_ovario),as.numeric(input$mama_fam_baron),as.numeric(input$fam_prostata),as.numeric(input$askenazi),as.numeric(input$tricky),as.numeric(input$fam_cercano_temprana),as.numeric(input$fam_bcra),as.numeric(input$fam_general))
        resultado <- sum(lista_inputs)
        if (resultado > 0) {
            resultado = "Debe realizarse la prueba genética"
        }
        else {
            resultado = "No se requiere prueba genética"
        }
        
        return(resultado)
    })
}

# Run the application 
shinyApp(ui = ui, server = server)
