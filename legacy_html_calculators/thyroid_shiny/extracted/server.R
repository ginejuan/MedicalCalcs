server <- function(input, output, session) 
  
  
  observe({
    valores <- reactiveValues()
    # EDAD
    valores$Edad <- input$Edad
    #edad_cuadrado
    valores$Edad_cuadrado <- valores$Edad^2
    valores$Edad_cubo <- valores$Edad^3
    
    # EDAD_20_65
    if ( (valores$Edad > 29) & (valores$Edad < 56) ) {valores$Edad_30_55_cat <- "30 - 55"}
    if (valores$Edad < 30) {valores$Edad_30_55_cat <- "low - 29"}
    if (valores$Edad > 55) {valores$Edad_30_55_cat <- "56 - high"}
    # else {valores$Edad_20_70 <- 1}
    
    # SEXO
    if (input$Sexo ==  "Male") {valores$Sex <- "HOMBRE"}
    else {valores$Sex <- "MUJER"}
    
    # Antecedentes de cÃ¡ncer de tiroides
    if (input$AntCDT == "Yes"){valores$AntCDT <- "SI"}
    else {valores$AntCDT <- "NO"}
    
    # TSH 
    valores$TSH <- input$TSH
    if (input$TSH < 0.37) {valores$tsh_cuali <- "0 - 0.369"}
    if (input$TSH > 0.369 & input$TSH < 4.701) {valores$tsh_cuali <- "0.37 - 4.7"}
    if (input$TSH > 4.7) {valores$tsh_cuali <- "4.701 - higher"}
    
    if (input$Tiroiditis == "No"){valores$Tiroiditis <- "No tiroiditis"}
    else {valores$Tiroiditis <- "Tiroiditis"}
    
    # DiÃ¡metro mayor del nÃ³dulo
    valores$Diametro <- input$Diametro
    
    
    # Ecogenicidad
    if (input$Ecogenicidad == "Isoechoic or Hyperechoic") {valores$Ecogenicidad <- 0}
    if (input$Ecogenicidad == "Anechoic") {valores$Ecogenicidad <- 2}
    
    
    if (input$Ecogenicidad == "Hypoechoic") {valores$Ecogenicidad <- 1}
    
    # MÃ¡rgenes
    if (input$Margenes == "Well-defined"){valores$Margenes <- "MARGENES REGULARES"}
    else {valores$Margenes <- "IRREGULARES O MICROLOBULADOS"}
    
    # CONSISTENCIA
    if (input$Consistencia == "Solid"){valores$Consistencia <- "Solido"}
    if (input$Consistencia == "Cystic"){valores$Consistencia <- "No solido"}
    if (input$Consistencia == "Mixted/Spongiform"){valores$Consistencia <- "No solido"}
    if (input$Consistencia == "Cystic"){valores$Consistencia2 <- "Cystic"}
    else {valores$Consistencia2 <-"No Cystic"}
    # Calcificaciones
    if (input$Calcificaciones == "No") {valores$Calcificaciones = "NO"}
    if (input$Calcificaciones == "Macrocalcifications") {valores$Calcificaciones = "MACROCALCIFICACIONES"}
    if (input$Calcificaciones == "Microcalcifications") {valores$Calcificaciones = "MICROCALCIFICACIONES"}
    
    
    # FORMA
    if (input$Forma == "Oval") {valores$Forma <- "MAS ANCHO QUE ALTO"}
    else {valores$Forma <- "MAS ALTO QUE ANCHO"}
    
    # GANGLIO SOSPECHOSO
    if (input$Ganglio == "No") {valores$Ganglio <- "Sin ganglio sospechoso"}
    else {valores$Ganglio <- "Con ganglio sospechoso"}
    
    if (valores$Diametro < 10)
    {if (valores$Calcificaciones == "NO")
    {if (valores$Margenes == "MARGENES REGULARES")
    {valores$ATA <- "CAUTION: In general, only nodules with a diameter equal to or greater than 10 mm should be studied"}}}
    
    if (valores$Diametro < 10)
    {if (valores$Calcificaciones == "MACROCALCIFICACIONES")
    {if (valores$Margenes == "MARGENES REGULARES")
    {valores$ATA <- "CAUTION: In general, only nodules with a diameter equal to or greater than 10 mm should be studied"}}}
    
    if (valores$Diametro <10)
    {if (valores$Calcificaciones == "MICROCALCIFICACIONES")
    {valores$ATA <- "CAUTION: In general, only nodules with a diameter equal to or greater than 10 mm should be studied. Assess the possibility of performing FNAB of the nodule"}}
    
    if (valores$Diametro <10)
    {if (valores$Margenes == "IRREGULARES O MICROLOBULADOS")
    {valores$ATA <- "CAUTION: In general, only nodules with a diameter equal to or greater than 10 mm should be studied. Assess the possibility of performing FNAB of the nodule"}}
    
    if (valores$Diametro <10)
    {if (valores$Forma == "MAS ALTO QUE ANCHO")
    {valores$ATA <- "CAUTION: In general, only nodules with a diameter equal to or greater than 10 mm should be studied. Assess the possibility of performing FNAB of the nodule"}}
    
    
    if (valores$Diametro <10)
    {if (valores$Ganglio == "Con ganglio sospechoso")
    {valores$ATA <- "CAUTION: In general, only nodules with a diameter equal to or greater than 10 mm should be studied. Assess the possibility of performing FNAB of the nodule"}}
    
    if (valores$Diametro >0.99 & valores$Diametro <15)
    {if (valores$Calcificaciones == "MICROCALCIFICACIONES")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    if (valores$Diametro >0.99 & valores$Diametro <15)
    {if (valores$Margenes == "IRREGULARES O MICROLOBULADOS")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    if (valores$Diametro >0.99 & valores$Diametro <15)
    {if (valores$Forma == "MAS ALTO QUE ANCHO")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    if (valores$Diametro >0.99 & valores$Diametro <15)
    {if (valores$Ganglio == "Con ganglio sospechoso")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    if (valores$Diametro >0.99 & valores$Diametro <15)
    {if (valores$Ecogenicidad == "HIPOECOGENICO")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    if (valores$Diametro >0.99 & valores$Diametro <15)
    {if (valores$Consistencia == "Solido")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    if (valores$Diametro >=15 & valores$Diametro <20)
    {if (valores$Consistencia == "Solido")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    if (valores$Diametro >=15 & valores$Diametro <20)
    {if (valores$Ecogenicidad == "ISOECOGENICO")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    
    if (valores$Diametro >=15 & valores$Diametro <20)
    {if (valores$Ecogenicidad == "HIPERECOGENICO")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    if (valores$Diametro >=20 )
    {if (valores$Consistencia == "Solido")
    {valores$ATA <- "CAUTION: FNAP of the nodule is recommended."}}
    
    #    if (valores$Consistencia == "Mixto")
    #      {valores$ATA2 <- "Consider FNAP to evacuate the cyst if the patient has discomfort or aesthetic discommodity"}
    
    if (valores$Ganglio == "Con ganglio sospechoso")
    {valores$ATA3 <- "It is recommended to perform FNAB of the suspected lymph node."}
    #Meto los valores introducidos por el usuario en un data frame temporal
    temporal = data.frame(EDAD = valores$Edad, 
                          #                          edad_30_55_cat = as.factor(valores$Edad_30_55_cat),
                          edad_cuadrado = valores$Edad_cuadrado,
                          edad_cubo = valores$Edad_cubo,
                          SEX = valores$Sex, 
                          AFCDT = valores$AntCDT, 
                          TSH = valores$TSH,
                          tsh_cuali = valores$tsh_cuali,
                          TIROIDITIS = valores$Tiroiditis,
                          TAMAÑO = valores$Diametro,
                          SOLIDO = valores$Consistencia,
                          HIPOECOICO = valores$Ecogenicidad,
                          MARGENESIRREGULARES = valores$Margenes,
                          CALCIO = valores$Calcificaciones,
                          FORMA = valores$Forma,
                          GANGLIOSOSPECHOSO = valores$Ganglio
    )
    prediccion = predict(multivariante_final, temporal, type="link", se.fit = TRUE)
    probabilidad = plogis(prediccion$fit)*100
    ICSUPLOGIT = prediccion$fit + 1.96 * prediccion$se.fit
    ICINFLOGIT = prediccion$fit - 1.96 * prediccion$se.fit
    ICSUP = plogis(ICSUPLOGIT)*100
    ICINF = plogis(ICINFLOGIT)*100
    output$riesgo <- renderText( {paste0("Thyroid cancer risk: ",as.character(format(round(probabilidad,2), nsmall =2)),"%")})
    output$conf_int <- renderText( {paste0( "(95% Confidence interval: ", as.character(format(round(ICINF,2), nsmall = 2)) ,"% to ", as.character(format(round(ICSUP,2), nsmall = 2)),"%",")")} )
    output$ATA <- renderText(valores$ATA)
    output$ATA3 <- renderText(valores$ATA3)
    if (input$Ecogenicidad == "Anechoic") {
      #updateSelectInput(session, "Consistencia",choices = NULL, selected ="Cystic")
      updateSelectInput(session, "Margenes", choices = NULL, selected = "Well-defined")
      updateSelectInput(session, "Calcificaciones", choices = NULL, selected = "No")
      updateSelectInput(session, "Forma", choices = NULL, selected = "Oval")
      updateSelectInput(session, "Ganglio", choices = NULL, selected = "No")
      output$riesgo <- renderText( {paste0("Thyroid cancer risk: ","0","%")})
      output$conf_int <- renderText( {paste0( "(95% Confidence interval: ", "0" ,"% to ", "0","%",")")} )
      valores$ATA2 <- "You have selected that the nodule is anechoic or cystic. In general, it is accepted that a cystic or anechoic nodule is benign, so the risk of thyroid cancer is zero. In addition, those parameters that indicate benignity have been automatically selected. Consider FNAP to evacuate the cyst if the patient has discomfort or aesthetic discommodity."
    }
    if (input$Consistencia == "Cystic") {
      # updateSelectInput(session, "Ecogenicidad", choices = NULL, selected = "Anechoic")
      updateSelectInput(session, "Margenes", choices = NULL, selected = "Well-defined")
      updateSelectInput(session, "Calcificaciones", choices = NULL, selected = "No")
      updateSelectInput(session, "Forma", choices = NULL, selected = "Oval")
      updateSelectInput(session, "Ganglio", choices = NULL, selected = "No")
      output$riesgo <- renderText( {paste0("Thyroid cancer risk: ","0","%")})
      output$conf_int <- renderText( {paste0( "(95% Confidence interval: ", "0" ,"% to ", "0","%",")")} )
      valores$ATA2 <- "You have selected that the nodule is anechoic or cystic. In general, it is accepted that a cystic or anechoic nodule is benign, so the risk of thyroid cancer is zero. In addition, those parameters that indicate benignity have been automatically selected. Consider FNAP to evacuate the cyst if the patient has discomfort or aesthetic discommodity."
    }
    
    output$ATA2 <- renderText(valores$ATA2)
    
    
  })