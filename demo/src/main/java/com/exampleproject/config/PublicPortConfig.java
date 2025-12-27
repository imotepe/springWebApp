package com.exampleproject.config;

import org.apache.catalina.connector.Connector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PublicPortConfig {

    @Bean
    WebServerFactoryCustomizer<TomcatServletWebServerFactory> publicPortCustomizer(
            @Value("${app.public-port:8082}") int publicPort,
            @Value("${server.port:8080}") int serverPort
    ) {
        return factory -> {
            if (publicPort <= 0 || publicPort == serverPort) {
                return;
            }
            Connector connector = new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
            connector.setPort(publicPort);
            factory.addAdditionalTomcatConnectors(connector);
        };
    }
}
